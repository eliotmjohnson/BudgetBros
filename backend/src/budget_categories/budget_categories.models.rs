use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;

use crate::line_items::line_items_models::LineItemReduced;

#[derive(Serialize, FromRow, Debug)]
pub struct BudgetCategory {
    pub id: String,
    pub name: String,
}

#[derive(Serialize, Deserialize, FromRow, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UpdatedBudgetCategory {
    pub budget_category_id: String,
    pub name: String,
}

#[derive(Serialize, Deserialize, FromRow, Debug)]
#[serde(rename_all = "camelCase")]
pub struct BudgetCategoryDeleteRequest {
    pub budget_id: String,
    pub category_order: Vec<String>,
}

#[derive(Serialize, Deserialize, FromRow, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NewBudgetCategory {
    pub name: String,
    pub user_id: String,
    pub budget_id: String,
    pub category_order: Vec<String>,
}

#[derive(Serialize, FromRow, Debug)]
pub struct NewBudgetCategoryId {
    pub id: String,
}

#[derive(Serialize, FromRow)]
pub struct BudgetCategoryWithLineItemsRow {
    pub budget_category_id: String,
    pub budget_category_name: String,
    pub line_item_id: String,
    pub line_item_name: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BudgetCategoryWithLineItems {
    pub budget_category_id: String,
    pub budget_category_name: String,
    pub line_items: Vec<LineItemReduced>,
}

#[derive(Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct ReturnedBudgetCategoryOrder {
    pub category_order: Vec<String>,
}
