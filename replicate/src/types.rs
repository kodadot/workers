use std::collections::HashMap;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct PredictionStatus {
    completed_at: Option<String>,
    created_at: String,
    error: Option<String>,
    id: String,
    input: Input,
    logs: Option<String>,
    // metrics: String, ?? { "predict_time": 8.760063 }
    output: Option<Vec<String>>,
    started_at: Option<String>,
    status: String,
    // urls: String, ?? { "get": "https://api.replicate.com/v1/predictions/6wkgvnkv2rhrtcjuq722vfp6mq", "cancel": "https://api.replicate.com/v1/predictions/6wkgvnkv2rhrtcjuq722vfp6mq/cancel" }
    version: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ReplicateInput {
    pub prompt: String,
    pub width: Option<String>,
    pub height: Option<String>,
    pub num_outputs: Option<String>,
    pub guidance_scale: Option<String>,
    pub num_inference_steps: Option<String>,
}

type Input = HashMap<String, String>;

#[derive(Serialize, Deserialize, Debug)]
pub struct PredictionRequest {
    version: String,
    input: Input,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct PredictionRequestStatus {
    created_at: Option<String>,
    id: String,
    input: HashMap<String, String>,
    logs: Option<String>,
    status: String,
    version: String,
}
