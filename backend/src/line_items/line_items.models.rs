use serde::Serialize;
use sqlx::{self, FromRow};

#[derive(Serialize, FromRow, Debug)]
pub struct LineItem {
    id: i64,
    name: String,
    is_fund: bool,
    planned_amount: f64,
    starting_balance: f64,
}

#[derive(Serialize, FromRow, Debug)]
#[serde(rename_all = "camelCase")]
pub struct LineItemReduced {
    pub line_item_id: i64,
    pub line_item_name: String,
}
