use serde::{Deserialize, Serialize};

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
pub struct PredictionStatus {
    completed_at: String,
    created_at: String,
    id: String,
    input: Input,
    logs: String,
    // metrics: String, ?? { "predict_time": 8.760063 }
    output: Vec<String>,
    started_at: String,
    status: String,
    // urls: String, ?? { "get": "https://api.replicate.com/v1/predictions/6wkgvnkv2rhrtcjuq722vfp6mq", "cancel": "https://api.replicate.com/v1/predictions/6wkgvnkv2rhrtcjuq722vfp6mq/cancel" }
    version: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Input {
    pub prompt: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct PredictionRequest {
    version: String,
    input: Input,
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
pub struct PredictionRequestStatus {
    created_at: String,
    id: String,
    input: Input,
    logs: Option<String>,
    status: String,
    version: String,
}
