use serde::{Deserialize, Serialize};
use serde_json::json;
use worker::*;

mod cors;

type CorsHeaders = cors::CorsHeaders;

#[derive(Deserialize, Serialize)]
struct Error {
    status: u16,
    message: String,
}

#[derive(Deserialize, Serialize)]
struct Count {
    id: String,
    visit: u32,
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
    Response::ok("KodaDot View Counter")
}

async fn count<D>(_: Request, ctx: RouteContext<D>) -> Result<Response> {
    let id = ctx.param("id").unwrap();
    let d1 = ctx.env.d1("DB")?;

    let statement = d1
        .prepare("SELECT * FROM Counters WHERE id = ?");
    let query = statement.bind(&[id.to_string().into()])?;

    return match query.first::<Count>(None).await? {
        Some(c) => Response::from_json(&c),
        None => respond_error("Key not found", 404),
    }
}

async fn visit<D>(_: Request, ctx: RouteContext<D>) -> Result<Response> {
    let id = ctx.param("id").unwrap();
    let d1 = ctx.env.d1("DB").unwrap();

    let statement = d1
        .prepare("INSERT INTO Counters (id, visit) VALUES (?, 0) ON CONFLICT(id) DO UPDATE SET visit = Counters.visit + 1");

    statement.bind(&[id.to_string().into()])?.run().await?;
    
    Response::ok(
        json!(Error {
            status: 200,
            message: "Greetings traveler!".to_string(),
        }).to_string()
    )
}

async fn clear<D>(_: Request, ctx: RouteContext<D>) -> Result<Response> {
    let id = ctx.param("id").unwrap();
    let d1 = ctx.env.d1("DB").unwrap();

    let statement = d1
        .prepare("UPDATE Counters SET visit = 0 WHERE id = ?");

    statement.bind(&[id.to_string().into()])?.run().await?;
    
    Response::ok(
        json!(Error {
            status: 200,
            message: format!("Cleared counter for {}", id).to_string(),
        }).to_string()
    )
}

fn empty_response<D>(_: Request, _: RouteContext<D>) ->  Result<Response> {
    CorsHeaders::response()
}

#[event(fetch)]
async fn main(req: Request, env: Env, _ctx: Context) -> Result<Response> {
    let router = Router::new();
    CorsHeaders::update(router
        .get("/", root)
        .get_async("/:id", count)
        .post_async("/:id", visit)
        .delete_async("/:id", clear)
        .options("/", empty_response)
        .options("/:id", empty_response)
        .run(req, env)
        .await)
}
