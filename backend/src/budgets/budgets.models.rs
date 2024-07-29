use serde::Serialize;
use sqlx::{self, FromRow};

#[derive(Serialize, FromRow, Debug)]
pub struct Budget {
    pub id: i64,
    pub user_id: i64,
    pub month_number: i64,
    pub year: i64,
}

pub struct TransactionData {
    id: i64,
    title: String,
    merchant: String,
    amount: f64,
    notes: String,
    date: String,
}

pub struct LineItemData {
    id: i64,
    name: String,
    is_fund: bool,
    planned_amount: f64,
    starting_balance: f64,
    transactions: Vec<TransactionData>,
}

pub struct BudgetCategoryData {
    id: i64,
    name: String,
    budget_line_items: Vec<LineItemData>,
}

pub struct BudgetResponseData {
    budget_id: i64,
    month_number: i32,
    year: i64,
    budget_categories: Vec<BudgetCategoryData>,
}
