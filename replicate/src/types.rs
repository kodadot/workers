use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Serialize, Deserialize, Debug)]
pub struct PredictionStatus {
    completed_at: Option<String>,
    created_at: String,
    error: Option<String>,
    id: String,
    // input: Input,
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
    #[serde(skip_serializing_if = "Option::is_none")]
    pub negative_prompt: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub width: Option<u16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub height: Option<u16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub num_outputs: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub guidance_scale: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub num_inference_steps: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub seed: Option<u32>,
}

type Input = HashMap<String, Value>;

#[derive(Serialize, Deserialize, Debug)]
pub struct PredictionRequest {
    version: String,
    input: Input,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct PredictionRequestStatus {
    id: String,
    created_at: Option<String>,
    input: Input,
    logs: Option<String>,
    status: String,
    version: String,
}
