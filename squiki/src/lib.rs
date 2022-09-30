use serde::{Deserialize, Serialize };
use serde::de::DeserializeOwned;
use worker::*;
use reqwest::{ Client };
use std::result::{ Result as StdResult };

mod utils;

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
struct SubsquidSimpleResponse {
    id: u64,
    description: Option<String>,
    name: String,
    title: Option<String>,
    logoUrl: Option<String>
}

type SquidList = Vec<SubsquidSimpleResponse>;


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

const SUBSQUID_BASE_API: &str = "https://saas.infra.gc.subsquid.io/api/client/";

async fn status<D>(_: Request, ctx: RouteContext<D>) ->  Result<Response> {
    // let id = match ctx.param("id") {
    //     Some(account_id) => account_id,
    //     None => return CorsHeaders::update(Response::error("Missing Account Id", 400)),
    // };

    let token = get_token(&ctx).unwrap();

    let response = call_fetch::<SquidList>("squid".to_owned(), &token).await;

    match response {
        Ok(json) => CorsHeaders::update(Response::from_json(&json)),
        Err(_) => CorsHeaders::update(Response::error("Failed to get user key", 500))
    }
}

async fn call_fetch<T: DeserializeOwned>(url: String, token: &String) -> StdResult<T, reqwest::Error>  {
    let client = Client::new();
    let response = client.get(SUBSQUID_BASE_API.to_string() + &url)
        .header("Authorization", "token ".to_string() + &token)
        .send()
        .await
        .unwrap()
        .json::<T>()
        .await;

   return response
}

fn empty_response<D>(_: Request, _: RouteContext<D>) ->  Result<Response> {
    CorsHeaders::response()
}

fn get_token<D>(ctx: &RouteContext<D>) -> Result<String> {
    return Ok(ctx.secret("SUBSQUID_API_TOKEN")?.to_string());
}

#[event(fetch)]
pub async fn main(req: Request, env: Env, _ctx: worker::Context) -> Result<Response> {
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
        .get("/", |_, _| Response::ok("Hello from Workers!"))
        .get_async("/status", status)
        // .post_async("/pinJson/:name", pin_json_to_ipfs)
        // .post_async("/pinJson", pin_json_to_ipfs)
        // .post_async("/pinFile", pin_file_to_ipfs)
        .options("/status", empty_response)
        // .options("/pinJson/:name", empty_response)
        // .options("/pinJson", empty_response)
        // .options("/pinFile", empty_response)
        .run(req, env)
        .await
}
