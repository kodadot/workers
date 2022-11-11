use reqwest::{ Client, Error, header::AUTHORIZATION };
use serde::de::DeserializeOwned;
use std::result::{ Result as StdResult };
use worker::{ console_debug };

const REPLICATE_BASE_API: &str = "https://api.replicate.com/v1";

pub async fn call_fetch<T: DeserializeOwned>(url: &str, token: &String) -> StdResult<T, Error>  {
  let client = Client::new();
  console_debug!("replicate token: {}, URL: {}", token, url);
  let response = client.get(REPLICATE_BASE_API.to_string() + url)
      .header(AUTHORIZATION, "Token ".to_string() + &token)
      .send()
      .await
      .unwrap()
      .json::<T>()
      .await;

 return response
}