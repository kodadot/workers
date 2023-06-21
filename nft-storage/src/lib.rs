use serde::{Deserialize, Serialize};
use serde_json::json;
use worker::*;
use reqwest::{ Client, Body };
use chrono::{Duration, Utc, SecondsFormat};
use validator::Validate;
use utils::cors::CorsHeaders;

mod panic;


#[derive(Serialize, Deserialize, Debug)]
struct StorageApiResponse {
    ok: bool,
    value: ValueApiResponse
}

#[derive(Serialize, Deserialize, Debug)]
struct PinningKey {
    ok: bool,
    value: String
}

#[derive(Serialize, Deserialize, Debug)]
struct PinningKeyResponse {
    expiry: String,
    token: String
}

#[derive(Serialize, Deserialize, Debug)]
struct ValueApiResponse {
    cid: String,
    size: u32,
    r#type: String,
    created: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct UrlPinRequest {
    url: String,
}

#[derive(Serialize, Deserialize, Debug, Validate)]
struct Metadata {
    #[validate(required(message = "`name` is required"))]
    name: Option<String>,
    #[validate(required(message = "`description is required`"))]
    description: Option<String>,
    #[validate(
        required(message = "`image` is required"),
        url(message = "`image` must be valid URL"),
        contains(pattern = "ipfs://ipfs/", message = "`image` must be an IPFS URL")
    )]
    image: Option<String>,
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

fn root(_: Request, _: RouteContext<()>) -> Result<Response> {
    Response::ok("KodaDot NFT Storage")
}

async fn get_user_key<D>(_: Request, ctx: RouteContext<D>) ->  Result<Response> {
    match ctx.param("account") {
        Some(account_id) => account_id,
        None => return Response::error("Missing Account Id", 400),
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
            let dt = Utc::now() + Duration::days(13);
            let res = PinningKeyResponse {
                expiry: dt.to_rfc3339_opts(SecondsFormat::Millis, true),
                token: json.value
            };   
            Response::from_json(&res)
        },
        Err(_) => Response::error("Failed to get user key", 500)
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
        Ok(json) => Response::from_json(&json),
        Err(e) => Response::error(e.to_string(), 500)
    }
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

    match response {
        Ok(json) => Response::from_json(&json),
        Err(e) => Response::error(e.to_string(), 500)
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
        Ok(json) => Response::from_json(&json),
        Err(e) => Response::error(e.to_string(), 500)
    }
}

async fn pin_metadata_to_ipfs<D>(mut req: Request, ctx: RouteContext<D>) ->  Result<Response> {
    let body: Metadata = req.json().await?;
    match body.validate() {
        Ok(_) => {},
        Err(e) => return Response::error(json!(e).to_string(), 400)
    }

    let content_type = String::from("application/json");
    let token = get_token(&ctx)?;

    let client = Client::new();
    let response = client.post(NFT_STORAGE_BASE_API.to_string() + "/upload")
        .header("Authorization", "Bearer ".to_string() + &token)
        .header("Content-Type", content_type)
        .json(&body)
        .send()
        .await
        .unwrap()
        .json::<StorageApiResponse>()
        .await;

    match response {
        Ok(json) => Response::from_json(&json),
        Err(err) => Response::error(err.to_string(), 500),
    }
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
    panic::set_panic_hook();

    // Optionally, use the Router to handle matching endpoints, use ":name" placeholders, or "*name"
    // catch-alls to match on specific patterns. Alternatively, use `Router::with_data(D)` to
    // provide arbitrary data that will be accessible in each route via the `ctx.data()` method.
    let router = Router::new();

    // Add as many routes as your Worker needs! Each route will get a `Request` for handling HTTP
    // functionality and a `RouteContext` which you can use to  and get route parameters and
    // Environment bindings like KV Stores, Durable Objects, Secrets, and Variables.
    CorsHeaders::update(router
        .get("/", root)
        .get_async("/getKey/:account", get_user_key)
        .post_async("/pinJson/:name", pin_json_to_ipfs)
        .post_async("/pinJson", pin_json_to_ipfs)
        .post_async("/pinMetadata", pin_metadata_to_ipfs)
        .post_async("/pinFile", pin_file_to_ipfs)
        .post_async("/pinUrl", pin_url_to_ipfs)
        .options("/*pathname", empty_response)
        .run(req, env)
        .await)
}
