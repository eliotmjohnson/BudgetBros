use super::line_items_models::{LineItem, NewLineItem};
use crate::AppState;
use actix_web::web::Data;

pub async fn add_line_item(
    state: Data<AppState>,
    new_line_item: NewLineItem,
) -> Result<Vec<LineItem>, sqlx::Error> {
    let query = "INSERT INTO line_items
        (name, is_fund, planned_amount, starting_balance, budget_category_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *";

    sqlx::query_as::<_, LineItem>(query)
        .bind(new_line_item.name)
        .bind(new_line_item.is_fund)
        .bind(new_line_item.planned_amount)
        .bind(new_line_item.starting_balance)
        .bind(new_line_item.budget_category_id)
        .fetch_all(&state.db)
        .await
}
