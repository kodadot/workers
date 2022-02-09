use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use worker::*;
use reqwest::{ Client };
use reqwest::multipart::{ Form, Part };

mod utils;


type JsonResponse = HashMap<String, String>;

struct PinningKey {
    token: String,
    expiry: Date,
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
struct EstuaryApiResponse {
    cid: String,
    estuaryId: u32,
    providers: Vec<String>,
}

#[derive(Debug)]
struct CorsHeaders {}

impl CorsHeaders {
    pub fn new() -> Result<Headers> {
        let mut headers = Headers::new();
        headers.set("Access-Control-Allow-Origin", "*")?;
        headers.set("Access-Control-Allow-Methods", "GET, HEAD, POST, OPTIONS")?;
        headers.set("Access-Control-Allow-Headers", "*")?;
        return Ok(headers);
    }

    pub fn response() -> Result<Response> {
        let resp = Response::empty()?.with_headers(CorsHeaders::new()?);
        return Ok(resp);
    }

    pub fn update(response: Result<Response>) -> Result<Response> {
        let resp = response?.with_headers(CorsHeaders::new()?);
        return Ok(resp);
    }
}

fn log_request(req: &Request) {
    console_log!(
        "{} - [{}], located at: {:?}, within: {}",
        Date::now().to_string(),
        req.path(),
        req.cf().coordinates().unwrap_or_default(),
        req.cf().region().unwrap_or("unknown region".into())
    );
}

const ESTUARY_BASE_API: &str = "https://api.estuary.tech/";

async fn get_user_key<D>(_: Request, ctx: RouteContext<D>) ->  Result<Response> {
    match ctx.param("account") {
        Some(account_id) => account_id,
        None => return CorsHeaders::update(Response::error("Missing Account Id", 400)),
    };

    let token = get_token(&ctx).unwrap();

    let client = Client::new();
    let response = client.post(ESTUARY_BASE_API.to_string() + "user/api-keys")
        .query(&[("perms", "upload"), ("expiry", "30m")])
        .header("Authorization", "Bearer ".to_string() + &token)
        .send()
        .await
        .unwrap()
        .json::<JsonResponse>()
        .await;

    match response {
        Ok(json) => CorsHeaders::update(Response::from_json(&json)),
        Err(_) => CorsHeaders::update(Response::error("Failed to get user key", 500))
    }
}

async fn pin_json_to_ipfs<D>(mut req: Request, ctx: RouteContext<D>) ->  Result<Response> {
    let val = req.bytes().await?;

    let name = match ctx.param("name") {
        Some(x) => String::from(x) + ".json",
        None => "hello.json".to_string(),
    };

    let part = Part::bytes(val)             
    .file_name(name)
    .mime_str("application/json").unwrap();
    
    let form = Form::new().part("data", part);

    let token = get_token(&ctx).unwrap();

    let client = Client::new();
    let response = client.post("https://shuttle-5.estuary.tech/content/add")
        .header("Authorization", "Bearer ".to_string() + &token)
        .multipart(form)
        .send()
        .await
        .unwrap()
        .json::<EstuaryApiResponse>()
        .await;

    match response {
        Ok(json) => CorsHeaders::update(Response::from_json(&json)),
        Err(e) => CorsHeaders::update(Response::error(e.to_string(), 500))
    }
}


async fn remove_expired_user_key<D>(_: Request, ctx: RouteContext<D>) ->  Result<Response> {
    let token = get_token(&ctx).unwrap();

    let client = Client::new();
    let response = client.get(ESTUARY_BASE_API.to_string() + "user/api-keys")
        .header("Authorization", "Bearer ".to_string() + &token)
        .send()
        .await
        .unwrap()
        .json::<Vec<JsonResponse>>()
        .await;

    let keys: Vec<JsonResponse> = match response {
        Ok(vec) => vec,
        Err(_) => Vec::new(),
    };

    let now = Date::now().as_millis();
    let expired_keys: Vec<PinningKey> = keys.into_iter().map(|x| {
        let expiry = DateInit::String(x["expiry"].to_string()).into();
        let token = x["token"].to_string();
        PinningKey {
            token,
            expiry,
        }
    }).filter(|x| x.expiry.as_millis() <= now).collect();

    for key in expired_keys {
        let client = Client::new();
        let _ = client.delete(ESTUARY_BASE_API.to_string() + "user/api-keys/" + &key.token)
            .header("Authorization", "Bearer ".to_string() + &token)
            .send().await;
    };


    return CorsHeaders::response();
}

fn empty_response<D>(_: Request, _: RouteContext<D>) ->  Result<Response> {
    CorsHeaders::response()
}

fn get_token<D>(ctx: &RouteContext<D>) -> Result<String> {
    return Ok(ctx.secret("ESTUARY_API_TOKEN")?.to_string());
}

#[event(fetch)]
pub async fn main(req: Request, env: Env) -> Result<Response> {
    log_request(&req);

    // Optionally, get more helpful error messages written to the console in the case of a panic.
    utils::set_panic_hook();

    // Optionally, use the Router to handle matching endpoints, use ":name" placeholders, or "*name"
    // catch-alls to match on specific patterns. Alternatively, use `Router::with_data(D)` to
    // provide arbitrary data that will be accessible in each route via the `ctx.data()` method.
    let router = Router::new();

    // Add as many routes as your Worker needs! Each route will get a `Request` for handling HTTP
    // functionality and a `RouteContext` which you can use to  and get route parameters and
    // Environment bindings like KV Stores, Durable Objects, Secrets, and Variables.
    router
        .get_async("/getKey/:account", get_user_key)
        .post_async("/pinJson/:name", pin_json_to_ipfs)
        .post_async("/pinJson", pin_json_to_ipfs)
        // .get_async("/unpin/:hash", get_user_key)
        .get_async("/removeExpired", remove_expired_user_key)
        .options("/getKey/:account", empty_response)
        .options("/pinJson/:name", empty_response)
        .options("/pinJson", empty_response)
        .options("/removeExpired", empty_response)
        .run(req, env)
        .await
}
