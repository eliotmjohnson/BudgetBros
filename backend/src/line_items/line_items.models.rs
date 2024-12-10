use serde::{Deserialize, Serialize};
use sqlx::{self, FromRow};

#[derive(Serialize, Deserialize, FromRow, Debug)]
#[serde(rename_all = "camelCase")]
pub struct LineItem {
    pub id: String,
    pub name: String,
    pub is_fund: bool,
    pub planned_amount: f64,
    pub starting_balance: f64,
}

#[derive(Serialize, Deserialize, FromRow, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UpdatedLineItem {
    pub id: String,
    pub name: String,
    pub planned_amount: f64,
}

#[derive(Serialize, Deserialize, FromRow, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NewLineItem {
    pub name: String,
    pub is_fund: bool,
    pub fund_id: Option<String>,
    pub planned_amount: f64,
    pub starting_balance: f64,
    pub budget_category_id: String,
    pub line_item_order: Vec<String>,
}

pub struct CopyLineItem {
    pub name: String,
    pub is_fund: bool,
    pub fund_id: Option<String>,
    pub planned_amount: f64,
    pub starting_balance: f64,
    pub budget_category_id: String,
}

#[derive(Serialize, Deserialize, FromRow, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LineItemDeleteRequest {
    pub line_item_order: Vec<String>,
    pub budget_category_id: String,
}

#[derive(Serialize, FromRow, Debug)]
#[serde(rename_all = "camelCase")]
pub struct LineItemReduced {
    pub line_item_id: String,
    pub line_item_name: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateFundRequest {
    pub starting_balance: f64,
    pub is_adding_fund: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SyncFundRequest {
    pub budget_id: String,
    pub starting_balance_change: f64,
}
