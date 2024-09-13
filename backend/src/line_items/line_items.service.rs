use super::line_items_models::{LineItem, NewLineItem, UpdatedLineItem};
use crate::AppState;
use actix_web::web::Data;
use sqlx::postgres::PgQueryResult;

pub async fn add_line_item(
    state: Data<AppState>,
    new_line_item: NewLineItem,
) -> Result<LineItem, sqlx::Error> {
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
        .fetch_one(&state.db)
        .await
}

pub async fn update_line_item(
    state: Data<AppState>,
    updated_line_item: UpdatedLineItem,
) -> Result<PgQueryResult, sqlx::Error> {
    let query = "
        UPDATE 
            line_items
        SET 
            name = $1, 
            is_fund = $2, 
            planned_amount = $3, 
            starting_balance = $4 
        WHERE 
            id = $5
        ";

    sqlx::query(query)
        .bind(updated_line_item.name)
        .bind(updated_line_item.is_fund)
        .bind(updated_line_item.planned_amount)
        .bind(updated_line_item.starting_balance)
        .bind(updated_line_item.id)
        .execute(&state.db)
        .await
}

pub async fn delete_line_item(
    state: Data<AppState>,
    line_item_id: String,
) -> Result<PgQueryResult, sqlx::Error> {
    let query = "
        DELETE FROM 
            line_items
        WHERE 
            id = $1
        ";

    sqlx::query(query)
        .bind(line_item_id)
        .execute(&state.db)
        .await
}
