use std::collections::HashMap;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
struct StorageApiResponse {
    ok: bool,
    value: ValueApiResponse
}

#[derive(Serialize, Deserialize, Debug)]
struct PinningKey {
    ok: bool,
    value: String
}

#[derive(Serialize, Deserialize, Debug)]
struct PinningKeyResponse {
    expiry: String,
    token: String
}

#[derive(Serialize, Deserialize, Debug)]
struct ValueApiResponse {
    cid: String,
    size: u32,
    r#type: String,
    created: String,
}