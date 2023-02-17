use reqwest::{header::{AUTHORIZATION, CONTENT_TYPE}, Client, Error, Body};
use serde::{de::DeserializeOwned};
use std::result::Result as StdResult;
use worker::console_debug;

pub const NFT_STORAGE_BASE_API: &str = "https://api.nft.storage/";

pub async fn call_post<T: DeserializeOwned>(
    token: &String,
    body: Body,
    content_type: &str,
) -> StdResult<T, Error> {
    let client = Client::new();
    let response = client
        .post(format!("{}/upload", NFT_STORAGE_BASE_API))
        .header(AUTHORIZATION, format!("Bearer {}", token))
        .header(CONTENT_TYPE, content_type)
        .body(body)
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

// pub async fn call_fetch<T: DeserializeOwned>(url: &str, token: &String) -> StdResult<T, Error> {
//     let client = Client::new();
//     let response = client
//         .get(REPLICATE_BASE_API.to_string() + url)
//         .header(AUTHORIZATION, "Token ".to_string() + &token)
//         .send()
//         .await
//         .unwrap()
//         .json::<T>()
//         .await;

//     return response;
// }
