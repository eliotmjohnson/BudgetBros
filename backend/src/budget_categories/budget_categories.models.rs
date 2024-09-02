use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;

use crate::line_items::line_items_models::LineItemReduced;

#[derive(Serialize, FromRow, Debug)]
pub struct BudgetCategory {
    pub id: i64,
    pub name: String,
}

#[derive(Serialize, Deserialize, FromRow, Debug)]
#[serde(rename_all = "camelCase")]
pub struct NewBudgetCategory {
    pub name: String,
    pub user_id: String,
    pub budget_id: String,
}

#[derive(Serialize, FromRow, Debug)]
pub struct NewBudgetCategoryId {
    pub id: i64,
}

#[derive(Serialize, FromRow)]
pub struct BudgetCategoryWithLineItemsRow {
    pub budget_category_id: i64,
    pub budget_category_name: String,
    pub line_item_id: i64,
    pub line_item_name: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]

pub struct BudgetCategoryWithLineItems {
    pub budget_category_id: i64,
    pub budget_category_name: String,
    pub line_items: Vec<LineItemReduced>,
}
