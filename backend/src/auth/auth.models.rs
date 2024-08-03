use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct TokenClaims {
    pub id: i64
}

#[derive(Serialize)]
pub struct LoginResponse {
    pub id: String,
    pub email: String,
    pub token: String,
}

#[derive(Deserialize)]
pub struct SessionData {
    pub email: Option<String>,
    pub token: String,
}