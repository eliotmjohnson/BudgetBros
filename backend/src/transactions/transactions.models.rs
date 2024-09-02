use chrono::{DateTime, Local};
use serde::{Deserialize, Serialize};
use sqlx::{self, FromRow};

#[derive(Serialize, Deserialize, FromRow, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Transaction {
    pub id: String,
    pub title: String,
    pub merchant: String,
    pub amount: f64,
    pub notes: String,
    pub date: DateTime<Local>,
    pub line_item_id: String,
    pub deleted: bool
}

#[derive(Serialize, Deserialize, FromRow, Debug)]
pub struct IsolatedTransaction {
    pub id: i64,
    pub title: String,
    pub merchant: String,
    pub amount: f64,
    pub notes: String,
    pub date: DateTime<Local>,
    pub line_item_id: i64,
    pub budget_category_name: String,
    pub deleted: bool
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct IsolatedTransactionResponse {
    pub id: String,
    pub title: String,
    pub merchant: String,
    pub amount: f64,
    pub notes: String,
    pub date: DateTime<Local>,
    pub line_item_id: String,
    pub budget_category_name: String,
    pub deleted: bool
}

#[derive(Serialize, Deserialize, FromRow, Debug)]
#[serde(rename_all = "camelCase")]
pub struct NewTransaction {
    pub title: String,
    pub merchant: String,
    pub amount: f64,
    pub notes: String,
    pub date: String,
    pub line_item_id: String,
    pub deleted: bool
}
