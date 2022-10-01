use serde::{Deserialize, Serialize };

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
pub struct SubsquidSimpleResponse {
    id: u64,
    description: Option<String>,
    name: String,
    title: Option<String>,
    logoUrl: Option<String>
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
pub struct SubsquidVersionResponse {
    id: u64,
    description: Option<String>,
    name: String,
    title: Option<String>,
    logoUrl: Option<String>,
    versions: Vec<SubsquidVersion>
}


#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
pub struct SubsquidVersion {
    id: u64,
    name: String,
    squidName: String,
    status: String,
    syncStatus: SubsquidSync,
    api: SubsquidStatus,
    deploy: SubsquidStatus,
    processor: SubsquidProcessorStatus,
    deploymentUrl: Option<String>
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SubsquidStatus {
    status: String
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
pub struct SubsquidSync {
    totalBlocks: u128,
    currentBlock: u128
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
pub struct SubsquidProcessorStatus {
    status: String,
    syncState: SubsquidSync,
}

pub type SquidList = Vec<SubsquidSimpleResponse>;