use serde::{Deserialize, Serialize};
use sqlx::{self, FromRow};

#[derive(Serialize, Deserialize, FromRow, Debug)]
pub struct Transaction {
    pub id: i64,
    pub title: String,
    pub merchant: String,
    pub amount: f64,
    pub notes: String,
    pub date: String,
    pub line_item_id: i64
}

#[derive(Serialize, Deserialize, FromRow, Debug)]
pub struct NewTransaction {
    pub title: String,
    pub merchant: String,
    pub amount: f64,
    pub notes: String,
    pub date: String,
    pub line_item_id: i64
}
