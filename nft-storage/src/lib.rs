use serde::{Deserialize, Serialize};
use worker::*;
use reqwest::{ Client, Body, StatusCode };
use nftstorage::{NftStorage, StorageApiResponse};
use std::result::Result as StdResult;

mod utils;
mod cors;
mod nftstorage;
mod fetch;

type CorsHeaders = cors::CorsHeaders;


#[derive(Serialize, Deserialize, Debug)]
struct UrlPinRequest {
    url: String,
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

const NFT_STORAGE_BASE_API: &str = "https://api.nft.storage";

fn universal_response<T: Serialize>(response: StdResult<T, reqwest::Error>) -> Result<Response> {
    match response {
        Ok(json) => CorsHeaders::update(Response::from_json(&json)),
        Err(err) => {
            let status = err.status().unwrap_or(StatusCode::INTERNAL_SERVER_ERROR).as_u16();
            let msg = err.to_string();
            console_log!("Error: {:?} - {}", status, msg);
            CorsHeaders::update(Response::error(msg, status))
        }
    }
}

async fn pin_json_to_ipfs<D>(mut req: Request, ctx: RouteContext<D>) ->  Result<Response> {
    let val = req.bytes().await?;

    let body = Body::from(val.clone());

    let token = get_token(&ctx).unwrap();
    let nftstorage = NftStorage::new(&token);
    let content_type = "application/json";
    let response = nftstorage.upload(body, &content_type).await;

    universal_response(response)
}

async fn pin_url_to_ipfs<D>(mut req: Request, ctx: RouteContext<D>) ->  Result<Response> {
    let val: UrlPinRequest = req.json().await?;
    let client = Client::new();
    let url = val.url;

    let content = client.get(url)
        .send()
        .await
        .unwrap();

    let content_type = content.headers().get("Content-Type").unwrap().clone();
    let content = content
        .bytes()
        .await
        .unwrap();

    let body = Body::from(content);

    let token = get_token(&ctx).unwrap();

    let response = client.post(NFT_STORAGE_BASE_API.to_string() + "/upload")
        .header("Authorization", "Bearer ".to_string() + &token)
        .header("Content-Type", content_type)
        .body(body)
        .send()
        .await
        .unwrap()
        .json::<StorageApiResponse>()
        .await;

    universal_response(response)
}

fn _get_query_param(url: &Url, key: &str) -> bool  {
    url.query_pairs().find(|(k, _)| k == key)
        .map(|(_, val)| val)
        .and_then(|c| c.parse::<bool>().ok()).unwrap_or(false)
}

async fn pin_file_to_ipfs<D>(mut req: Request, ctx: RouteContext<D>) ->  Result<Response> {
    let val = req.bytes().await?;
    // let cache = get_query_param(&req.url()?, "cache");
    let content_type = req.headers().get("Content-Type").unwrap().unwrap();

    let body = Body::from(val.clone());

    let token = get_token(&ctx).unwrap();
    let nftstorage = NftStorage::new(&token);
    let response = nftstorage.upload(body, &content_type).await;

    universal_response(response)
}

fn empty_response<D>(_: Request, _: RouteContext<D>) ->  Result<Response> {
    CorsHeaders::response()
}

fn get_token<D>(ctx: &RouteContext<D>) -> Result<String> {
    return Ok(ctx.secret("NFT_STORAGE_API_TOKEN")?.to_string());
}

#[event(fetch)]
async fn main(req: Request, env: Env, _ctx: Context) -> Result<Response> {
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
        .get("/getKey/:account", empty_response)
        .post_async("/pinJson/:name", pin_json_to_ipfs)
        .post_async("/pinJson", pin_json_to_ipfs)
        .post_async("/pinFile", pin_file_to_ipfs)
        .post_async("/pinUrl", pin_url_to_ipfs)
        .options("/getKey/:account", empty_response)
        .options("/pinJson/:name", empty_response)
        .options("/pinJson", empty_response)
        .options("/pinFile", empty_response)
        .options("/pinUrl", empty_response)
        .run(req, env)
        .await
}
