use serde::{Deserialize, Serialize};
use serde_json::json;
use worker::*;

static BASE_URL: &str = "https://kodadot.xyz/";

#[derive(Deserialize, Serialize)]
struct Error {
    status: u16,
    message: String,
}

#[derive(Deserialize, Serialize)]
struct Key {
    key: String,
}

#[derive(Deserialize, Serialize)]
struct KeyValue {
    key: String,
    url: String,
}

fn respond_error(message: &str, status: u16) -> Result<Response> {
    return Response::error(
        json!(Error {
            status: status,
            message: message.to_string(),
        }).to_string(),
        status,
    );
}

fn root(_: Request, _: RouteContext<()>) -> Result<Response> {
    Response::ok("KodaDot URL Shortener")
}

async fn key_get<D>(_: Request, ctx: RouteContext<D>) -> Result<Response> {
    let key = ctx.param("key").unwrap();
    let list = ctx.kv("list")?;
    return match list.get(key).text().await? {
        Some(value) => Response::redirect(
            Url::parse(&format!("{}{}", BASE_URL.to_owned(), value))?
        ),
        None => respond_error("Key not found", 404),
    };
}

async fn key_post<D>(mut req: Request, ctx: RouteContext<D>) -> Result<Response> {
    let body: KeyValue = req.json().await?;
    let list = ctx.kv("list")?;
    
    return match list.get(&body.key).text().await? {
        Some(_) => respond_error("Key already exists", 409),
        None => {
            list.put(&body.key, body.url)?.execute().await?;
            Response::from_json(&Key { key: body.key })
        }
    };
}

async fn key_delete<D>(_: Request, ctx: RouteContext<D>) -> Result<Response> {
    let key = ctx.param("key").unwrap();
    let list = ctx.kv("list")?;
    list.delete(&key).await?;
    return Response::from_json(&Key { key: key.to_string() });
}

#[event(fetch)]
async fn main(req: Request, env: Env, _ctx: Context) -> Result<Response> {
    let router = Router::new();
    router
        .get("/", root)
        .get_async("/:key", key_get)
        .post_async("/", key_post)
        .delete_async("/:key", key_delete)
        .run(req, env)
        .await
}
