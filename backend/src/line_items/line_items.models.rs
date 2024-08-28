use serde::{Deserialize, Serialize};
use sqlx::{self, FromRow};

#[derive(Serialize, FromRow, Debug)]
pub struct LineItem {
    id: i64,
    name: String,
    is_fund: bool,
    planned_amount: f64,
    starting_balance: f64,
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
