use serde::{Deserialize, Serialize};
use sqlx::{self, FromRow};

#[derive(Serialize, Deserialize, FromRow, Debug)]
pub struct LineItem {
    pub id: i64,
    pub name: String,
    pub is_fund: bool,
    pub planned_amount: f64,
    pub starting_balance: f64,
}

#[derive(Serialize, Deserialize, FromRow, Debug)]
#[serde(rename_all = "camelCase")]
pub struct NewLineItem {
    pub name: String,
    pub is_fund: bool,
    pub planned_amount: f64,
    pub starting_balance: f64,
    pub budget_category_id: i64,
}

#[derive(Serialize, FromRow, Debug)]
#[serde(rename_all = "camelCase")]
pub struct LineItemReduced {
    pub line_item_id: i64,
    pub line_item_name: String,
}
