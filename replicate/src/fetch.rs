use reqwest::{header::AUTHORIZATION, Client, Error, Response};
use serde::{de::DeserializeOwned, Serialize};
use std::result::Result as StdResult;
use worker::console_debug;

const REPLICATE_BASE_API: &str = "https://api.replicate.com/v1";

pub async fn call_post<T: DeserializeOwned, B: Serialize>(
    url: &str,
    token: &String,
    body: &B,
) -> StdResult<T, Error> {
    let client = Client::new();
    let response = client
        .post(format!("{}{}", REPLICATE_BASE_API, url))
        .header(AUTHORIZATION, format!("Bearer {}", token))
        .json(body)
        .send()
        .await;

    match response {
        Ok(response) => response.json::<T>().await,
        Err(e) => {
            console_debug!("Error: {:?}", e);
            Err(e)
        }
    }
}

pub async fn call_fetch<T: DeserializeOwned>(url: &str, token: &String) -> StdResult<T, Error> {
    let client = Client::new();
    console_debug!("replicate token: {}, URL: {}", token, url);
    let response = client
        .get(REPLICATE_BASE_API.to_string() + url)
        .header(AUTHORIZATION, "Token ".to_string() + &token)
        .send()
        .await
        .unwrap()
        .json::<T>()
        .await;

    return response;
}
