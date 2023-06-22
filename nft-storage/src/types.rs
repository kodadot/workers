use serde::{Deserialize, Serialize};
use validator::Validate;

#[derive(Serialize, Deserialize, Debug)]
pub struct StorageApiResponse {
    ok: bool,
    value: ValueApiResponse
}

#[derive(Serialize, Deserialize, Debug)]
pub struct PinningKey {
    ok: bool,
    pub value: String
}

#[derive(Serialize, Deserialize, Debug)]
pub struct PinningKeyResponse {
    pub expiry: String,
    pub token: String
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ValueApiResponse {
    cid: String,
    size: u32,
    r#type: String,
    created: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UrlPinRequest {
    pub url: String,
}

#[derive(Serialize, Deserialize, Debug, Validate)]
pub struct Metadata {
    #[validate(required(message = "`name` is required"))]
    name: Option<String>,
    #[validate(required(message = "`description` is required"))]
    // #[serde(deserialize_with = "string_or_number")]
    description: Option<String>,
    #[validate(
        required(message = "`image` is required"),
        url(message = "`image` must be valid URL"),
        contains(pattern = "ipfs://ipfs/", message = "`image` must be an IPFS URL")
    )]
    image: Option<String>,
}

// fn string_or_number<'de, D>(deserializer: D) -> Result<Option<String>, D::Error>
// where
//     D: Deserializer<'de>,
// {
//     let value: Option<Value> = Deserialize::deserialize(deserializer)?;
//     match value {
//         Some(Value::String(s)) => Ok(Some(s)),
//         Some(Value::Number(n)) => Ok(Some(n.to_string())),
//         None => Ok(None),
//         _ => Err(serde::de::Error::custom("expected string or null")),
//     }
// }
