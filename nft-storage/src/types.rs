use serde::{Deserialize, Serialize};
use validator::{Validate, ValidationError};
use chrono::{Utc, SecondsFormat, Duration};

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
    expiry: String,
    token: String
}

impl PinningKeyResponse {
    pub fn new(token: &String) -> PinningKeyResponse {
        let dt = Utc::now() + Duration::days(13);
        PinningKeyResponse {
            expiry: dt.to_rfc3339_opts(SecondsFormat::Millis, true),
            token: token.to_owned()
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ValueApiResponse {
    cid: String,
    size: u32,
    r#type: String,
    created: String,
}



#[derive(Serialize, Deserialize, Debug, Validate)]
pub struct Metadata {
    #[validate(length(min = 1))]
    name: String,
    #[validate(length(min = 1))]
    description: String,
    #[validate(contains = "ipfs://ipfs/")]
    image: String,
}

// fn validate_ipfs_uri(uri: &str) -> Result<(), ValidationError> {
//     if uri.starts_with("ipfs://ipfs/") {
//         return Ok(());
//     }

//     return Err(ValidationError::new("terrible_username"));
// }