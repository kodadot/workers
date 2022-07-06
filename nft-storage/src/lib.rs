use serde::{Deserialize, Serialize};
use worker::*;
use reqwest::{ Client, Body };

mod utils;

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
struct StorageApiResponse {
    ok: bool,
    value: ValueApiResponse
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
struct ValueApiResponse {
    cid: String,
    size: u32,
    r#type: String,
    created: String,
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

const NFT_STORAGE_BASE_API: &str = "https://api.nft.storage/";


async fn pin_json_to_ipfs<D>(mut req: Request, ctx: RouteContext<D>) ->  Result<Response> {
    let val = req.bytes().await?;

    let body = Body::from(val);

    let token = get_token(&ctx).unwrap();

    let client = Client::new();
    let response = client.post(NFT_STORAGE_BASE_API.to_string() + "/upload")
        .header("Authorization", "Bearer ".to_string() + &token)
        .header("Content-Type", "application/json")
        .body(body)
        .send()
        .await
        .unwrap()
        .json::<StorageApiResponse>()
        .await;

    match response {
        Ok(json) => CorsHeaders::update(Response::from_json(&json)),
        Err(e) => CorsHeaders::update(Response::error(e.to_string(), 500))
    }
}

fn empty_response<D>(_: Request, _: RouteContext<D>) ->  Result<Response> {
    CorsHeaders::response()
}

fn get_token<D>(ctx: &RouteContext<D>) -> Result<String> {
    return Ok(ctx.secret("NFT_STORAGE_API_TOKEN")?.to_string());
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
        .post_async("/pinJson/:name", pin_json_to_ipfs)
        .post_async("/pinJson", pin_json_to_ipfs)
        // .get_async("/unpin/:hash", get_user_key)
        .options("/pinJson/:name", empty_response)
        .options("/pinJson", empty_response)
        .run(req, env)
        .await
}
