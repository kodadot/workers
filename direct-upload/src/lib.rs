use serde::{Deserialize, Serialize};
use worker::*;
use reqwest::{ Client };

mod utils;
mod cors;

type CorsHeaders = cors::CorsHeaders;


#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
struct CloudflareApiResponse {
    result: ResultResponse,
    success: bool,
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
struct ResultResponse {
    id: String,
    uploadURL: String,
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

const CLOUDFLARE_BASE_API: &str = "https://api.cloudflare.com/client/v4/accounts/";
const PATH: &str = "/images/v1/direct_upload";

async fn get_user_key<D>(_: Request, ctx: RouteContext<D>) ->  Result<Response> {
    match ctx.param("account") {
        Some(account_id) => account_id,
        None => return CorsHeaders::update(Response::error("Missing Account Id", 400)),
    };

    let token = get_token(&ctx).unwrap();

    let client = Client::new();
    let response = client.post(CLOUDFLARE_BASE_API.to_string() + get_account(&ctx).unwrap().as_str() + PATH)
        .header("Authorization", "Bearer ".to_string() + &token)
        .header("Content-Type", "application/json")
        .send()
        .await
        .unwrap()
        .json::<CloudflareApiResponse>()
        .await;

    match response {
        Ok(json) => CorsHeaders::update(Response::from_json(&json)),
        Err(_) => CorsHeaders::update(Response::error("Failed to get user key", 500))
    }
}


fn empty_response<D>(_: Request, _: RouteContext<D>) ->  Result<Response> {
    CorsHeaders::response()
}

fn get_token<D>(ctx: &RouteContext<D>) -> Result<String> {
    return Ok(ctx.secret("CLOUDFLARE_IMAGE_API_TOKEN")?.to_string());
}

fn get_account<D>(ctx: &RouteContext<D>) -> Result<String> {
    return Ok(ctx.var("ACCOUNT_ID")?.to_string());
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
        .options("/getKey/:account", empty_response)
        .run(req, env)
        .await
}
