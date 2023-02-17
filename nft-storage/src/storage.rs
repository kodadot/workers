use crate::fetch::call_post;
use crate::types::{StorageApiResponse};
use reqwest::{Error, Body};

#[derive(Debug)]
pub struct Storage {
  pub token: String,
}

impl Storage {
    pub fn new(token: &str) -> Self {
      Storage {
            token: String::from(token),
        }
    }

    // pub async fn pin_file(&self, id: &str) -> Result<PredictionStatus, Error> {
    //     let url = format!("/{}/{}", "predictions", id);
    //     let response = call_fetch::<PredictionStatus>(&url, &self.token).await;
    //     response
    // }

    pub async fn pin_file(
        &self,
        val: &Vec<u8>,
        content_type: &str,
    ) -> Result<StorageApiResponse, Error> {
      let body = Body::from(val.to_owned());
        let response =
            call_post::<StorageApiResponse>(&self.token, body, &content_type)
                .await;
        response
    }
}