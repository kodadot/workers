use crate::fetch::call_post;
use reqwest::{ Body, Error};
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct StorageApiResponse {
    ok: bool,
    value: ValueApiResponse
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ValueApiResponse {
    cid: String,
    size: u32,
    r#type: String,
    created: String,
}

#[derive(Debug)]
pub struct NftStorage {
    pub token: String,
}

impl NftStorage {
    pub fn new(token: &str) -> Self {
        NftStorage {
            token: String::from(token),
        }
    }

    // pub async fn status(&self, id: &str) -> Result<PredictionStatus, Error> {
    //     let url = format!("/{}/{}", "predictions", id);
    //     let response = call_fetch::<PredictionStatus>(&url, &self.token).await;
    //     response
    // }

    pub async fn upload(
        &self,
        body: Body,
        content_type: &str,
    ) -> Result<StorageApiResponse, Error> {
        let url = format!("/{}", "upload");
        let response =
            call_post::<StorageApiResponse, Body>(&url, &self.token, body, content_type)
                .await;
        response
    }
}
