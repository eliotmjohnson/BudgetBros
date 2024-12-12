use chrono::{DateTime, Local};
use serde::{Deserialize, Serialize};
use sqlx::{self, FromRow};

#[derive(Serialize, Deserialize, FromRow, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Transaction {
    pub id: String,
    pub title: String,
    pub merchant: Option<String>,
    pub amount: f64,
    pub notes: Option<String>,
    pub date: DateTime<Local>,
    pub line_item_id: Option<String>,
    pub user_id: String,
    pub deleted: bool,
    pub is_income_transaction: bool,
}

#[derive(Serialize, Deserialize, FromRow, Debug)]
pub struct IsolatedTransaction {
    pub id: String,
    pub title: String,
    pub merchant: Option<String>,
    pub amount: f64,
    pub notes: String,
    pub date: DateTime<Local>,
    pub line_item_id: String,
    pub budget_category_name: String,
    pub deleted: bool,
    pub is_income_transaction: bool,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct IsolatedTransactionResponse {
    pub transaction_id: String,
    pub title: String,
    pub merchant: Option<String>,
    pub amount: f64,
    pub notes: String,
    pub date: DateTime<Local>,
    pub line_item_id: String,
    pub budget_category_name: String,
    pub deleted: bool,
    pub is_income_transaction: bool,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TransactionResponse {
    pub transaction_id: String,
    pub title: String,
    pub merchant: Option<String>,
    pub amount: f64,
    pub notes: String,
    pub date: DateTime<Local>,
    pub line_item_id: String,
    pub deleted: bool,
    pub is_income_transaction: bool,
}

#[derive(Serialize, Deserialize, FromRow, Debug)]
#[serde(rename_all = "camelCase")]
pub struct NewTransaction {
    pub user_id: String,
    pub title: String,
    pub merchant: Option<String>,
    pub amount: f64,
    pub notes: String,
    pub date: String,
    pub line_item_id: String,
    pub deleted: bool,
    pub is_income_transaction: bool,
}

#[derive(Serialize, Deserialize, FromRow, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UpdatedTransaction {
    pub transaction_id: String,
    pub title: String,
    pub merchant: Option<String>,
    pub amount: f64,
    pub notes: String,
    pub date: DateTime<Local>,
    pub line_item_id: Option<String>,
    pub deleted: bool,
    pub is_income_transaction: bool,
}
