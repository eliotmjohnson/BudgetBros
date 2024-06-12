use serde::Serialize;
use sqlx::prelude::FromRow;

#[derive(Serialize, FromRow, Debug)]
pub struct BudgetCategory {
    pub id: i64,
    pub name: String,
}
