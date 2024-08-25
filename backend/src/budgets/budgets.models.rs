use std::collections::HashMap;

use chrono::{DateTime, Local};
use serde::{Deserialize, Serialize};
use sqlx::{self, FromRow};

#[derive(Serialize, FromRow)]
pub struct Budget {
    pub budget_id: i64,
    pub user_id: i64,
    pub month_number: i64,
    pub year: i64,
}

#[derive(Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct BudgetRowData {
    pub budget_id: i64,
    pub user_id: i64,
    pub month_number: i64,
    pub year: i64,
    pub budget_category_id: i64,
    pub budget_category_name: String,
    pub line_item_id: i64,
    pub line_item_name: String,
    pub is_fund: bool,
    pub planned_amount: f64,
    pub starting_balance: f64,
    pub transaction_id: i64,
    pub title: String,
    pub merchant: String,
    pub amount: f64,
    pub notes: String,
    pub date: DateTime<Local>,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TransactionData {
    pub transaction_id: i64,
    pub title: String,
    pub merchant: String,
    pub amount: f64,
    pub notes: String,
    pub date: DateTime<Local>,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LineItemData {
    pub line_item_id: i64,
    pub name: String,
    pub is_fund: bool,
    pub planned_amount: f64,
    pub starting_balance: f64,
    pub transactions: Vec<TransactionData>,
}

pub struct BudgetCategoryDataMap {
    pub budget_category_id: i64,
    pub name: String,
    pub budget_line_items: HashMap<i64, LineItemData>,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct BudgetCategoryDataConverted {
    pub budget_category_id: i64,
    pub name: String,
    pub line_items: Vec<LineItemData>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BudgetResponseData {
    pub budget_id: Option<i64>,
    pub month_number: i64,
    pub year: i64,
    pub budget_categories: Vec<BudgetCategoryDataConverted>,
}
