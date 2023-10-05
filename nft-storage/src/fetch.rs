use reqwest::{header::{AUTHORIZATION, CONTENT_TYPE}, Client, Error, Body};
use serde::de::DeserializeOwned;
use std::result::Result as StdResult;
use worker::console_debug;

const NFT_STORAGE_BASE_API: &str = "https://api.nft.storage/";

pub async fn call_post<T: DeserializeOwned, B: Into<Body>>(
    url: &str,
    token: &String,
    body: B,
    content_type: &str,
) -> StdResult<T, Error> {
    let client = Client::new();
    let response = client
        .post(format!("{}{}", NFT_STORAGE_BASE_API, url))
        .header(AUTHORIZATION, format!("Bearer {}", token))
        .header(CONTENT_TYPE, content_type)
        .body(body)
        .send()
        .await;

    match response {
        Ok(response) => {
            match response.error_for_status() {
                Ok(response) => response.json::<T>().await,
                Err(e) => {
                    console_debug!("Response Error: {:?}", e);
                    return Err(e);
                }
            }
        },
        Err(e) => {
            console_debug!("Error: {:?}", e);
            Err(e)
        }
    }
}

// pub async fn call_fetch<T: DeserializeOwned>(url: &str, token: &String) -> StdResult<T, Error> {
//     let client = Client::new();
//     let response = client
//         .get(NFT_STORAGE_BASE_API.to_string() + url)
//         .header(AUTHORIZATION, "Token ".to_string() + &token)
//         .send()
//         .await
//         .unwrap()
//         .json::<T>()
//         .await;

//     return response;
// }
