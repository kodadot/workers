

use crate::types::PredictionStatus;
use crate::fetch::call_fetch;
use reqwest::Error;

#[derive(Debug)]
pub struct Replicate {
    pub token: String,
}

impl Replicate {
    pub fn new(token: &str) -> Self {
        Replicate { token: String::from(token) }
    }

    pub async fn status(&self, id: &str) -> Result<PredictionStatus, Error> {
        let url = format!("/{}/{}", "predictions", id);
        let response = call_fetch::<PredictionStatus>(&url, &self.token).await;
        response
    }

    // pub async fn predict(input: String) -> Result<> {

    // }
}
