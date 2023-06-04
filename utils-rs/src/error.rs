use serde::{Deserialize, Serialize};
use serde_json::json;
use worker::{Response, Result};

#[derive(Deserialize, Serialize)]
struct Error {
    status: u16,
    message: String,
}

pub fn respond_error(message: &str, status: u16) -> Result<Response> {
    return Response::error(
        json!(Error {
            status: status,
            message: message.to_string(),
        }).to_string(),
        status,
    );
}
