use crate::fetch::{call_fetch, call_post};
use crate::types::{PredictionRequest, PredictionRequestStatus, PredictionStatus};
use reqwest::{ Body, Error};

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
        body: &Body,
        content_type: &str,
    ) -> Result<StorageApiResponse, Error> {
        let url = format!("/{}", "upload");
        let response =
            call_post::<StorageApiResponse, Body>(&url, &self.token, prediction)
                .await;
        response
    }
}
