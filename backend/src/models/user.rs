use serde::{Deserialize, Serialize};
use sqlx::{self, FromRow};

#[derive(Deserialize)]
pub struct NewUser {
    first_name: String,
    last_name: String,
    email: String,
    password: String
}

#[derive(Serialize, FromRow)]
pub struct User {
    id: i64,
    first_name: String,
    last_name: String,
    email: String,
}