use serde::{Deserialize, Serialize};
use serde_json::json;
use validator::ValidationErrors;
use worker::{Response, Result};

#[derive(Deserialize, Serialize)]
struct Error {
    status: u16,
    message: String,
}

#[derive(Deserialize, Serialize)]
struct ValidationError {
    code: String,
    message: Option<String>,
}

#[derive(Deserialize, Serialize)]
struct Errors {
    status: u16,
    errors: Vec<ValidationError>,
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

pub fn respond_validation_errors(validation_errors: ValidationErrors) -> Result<Response> {
    let errors: Vec<ValidationError> = validation_errors
    .field_errors()
    .into_iter()
    .flat_map(|(_, errors)| errors)
    .map(|error| ValidationError {
        code: error.code.to_string(),
        message: error.message.as_ref().map(|cow| cow.to_string()),
    })
    .collect();

    return Response::error(
        json!(Errors {
            status: 400,
            errors: errors,
        }).to_string(),
        400,
    );
}
