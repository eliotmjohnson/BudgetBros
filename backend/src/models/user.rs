use serde::{Deserialize, Serialize};
use sqlx::{self, FromRow};

#[derive(Deserialize, FromRow, Debug)]
pub struct NewUser {
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub password: String
}

#[derive(Serialize, FromRow, Debug)]
#[serde(rename_all = "camelCase")]
pub struct User {
    id: i64,
    first_name: String,
    last_name: String,
    email: String,
}

#[derive(Serialize, FromRow)]
pub struct AuthUser {
    pub id: i32,
    pub email: String,
    pub password: String  
}