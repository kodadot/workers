use worker::*;

#[durable_object]
pub struct Views {
    count: i32,
    state: State,
}

#[durable_object]
impl DurableObject for Views {
    fn new(state: State, _env: Env) -> Self {
        Self {
            count: 0,
            state: state,
        }
    }

    async fn fetch(&mut self, req: Request) -> Result<Response> {
        let key = req.path();
        self.count = self.state.storage().get::<i32>(&key).await.unwrap_or(0) + 1;
        self.state.storage().put(&key, self.count).await?;
        Response::ok(self.count.to_string())
    }
}

#[event(fetch, respond_with_errors)]
pub async fn main(req: Request, env: Env, _ctx: worker::Context) -> Result<Response> {
    let router = Router::new();

    router
        .on_async("/*pathname", |req, ctx| async move {
            let namespace = ctx.durable_object("VIEWS")?;
            let stub = namespace.id_from_name("A")?.get_stub()?;
            stub.fetch_with_request(req).await
        })
        .run(req, env).await
}
