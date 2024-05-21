use serde::{Deserialize, Serialize};
use sqlx::{self, FromRow};

#[derive(Deserialize, FromRow, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NewUser {
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub password: String,
}

#[derive(Serialize, FromRow, Debug)]
#[serde(rename_all = "camelCase")]
pub struct User {
    pub id: i64,
    pub first_name: String,
    pub last_name: String,
    pub email: String,
}

#[derive(Serialize, FromRow)]
pub struct AuthUser {
    pub id: i64,
    pub email: String,
    pub password: String,
}