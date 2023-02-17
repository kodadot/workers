use worker::*;
use reqwest::{ Client, Body };

mod utils;
mod cors;
mod types;


use types::{StorageApiResponse, PinningKey, PinningKeyResponse};
use cors::{CorsHeaders, empty_response};


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


async fn get_user_key<D>(_: Request, ctx: RouteContext<D>) ->  Result<Response> {
    match ctx.param("account") {
        Some(account_id) => account_id,
        None => return CorsHeaders::update(Response::error("Missing Account Id", 400)),
    };

    let token = get_token(&ctx).unwrap();

    let client = Client::new();
    let response = client.post(NFT_STORAGE_BASE_API.to_string() + "ucan/token")
        .header("Authorization", "Bearer ".to_string() + &token)
        .send()
        .await
        .unwrap()
        .json::<PinningKey>()
        .await;

    match response {
        Ok(json) => {
            let res = PinningKeyResponse::new(&json.value);
            CorsHeaders::update(Response::from_json(&res))
        },
        Err(_) => CorsHeaders::update(Response::error("Failed to get user key", 500))
    }
}

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

async fn pin_file_to_ipfs<D>(mut req: Request, ctx: RouteContext<D>) ->  Result<Response> {
    let val = req.bytes().await?;
    let content_type = req.headers().get("Content-Type").unwrap().unwrap();

    let body = Body::from(val);

    let token = get_token(&ctx).unwrap();

    let client = Client::new();
    let response = client.post(NFT_STORAGE_BASE_API.to_string() + "/upload")
        .header("Authorization", "Bearer ".to_string() + &token)
        .header("Content-Type", content_type)
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

fn get_token<D>(ctx: &RouteContext<D>) -> Result<String> {
    return Ok(ctx.secret("NFT_STORAGE_API_TOKEN")?.to_string());
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
        .get_async("/getKey/:account", get_user_key)
        .post_async("/pinJson/:name", pin_json_to_ipfs)
        .post_async("/pinJson", pin_json_to_ipfs)
        .post_async("/pinFile", pin_file_to_ipfs)
        .options("/getKey/:account", empty_response)
        .options("/pinJson/:name", empty_response)
        .options("/pinJson", empty_response)
        .options("/pinFile", empty_response)
        .run(req, env)
        .await
}
