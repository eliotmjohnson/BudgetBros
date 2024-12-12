use super::line_items_models::{LineItem, NewLineItem, SyncFundRequest, UpdatedLineItem};
use crate::AppState;
use actix_web::web::Data;
use sqlx::postgres::PgQueryResult;
use sqlx::Row;

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
            planned_amount = $2
        WHERE 
            id = $3
        ";

    sqlx::query(query)
        .bind(updated_line_item.name)
        .bind(updated_line_item.planned_amount)
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

pub async fn update_line_item_order(
    state: Data<AppState>,
    new_line_item_order: Vec<String>,
    budget_category_id: String,
) -> Result<PgQueryResult, sqlx::Error> {
    let query = "UPDATE budget_categories
        SET line_item_order = $1
        WHERE id = $2
        ";

    sqlx::query(query)
        .bind(new_line_item_order)
        .bind(budget_category_id)
        .execute(&state.db)
        .await
}

pub async fn add_fund(
    state: Data<AppState>,
    starting_balance: f64,
    line_item_id: String,
) -> Result<String, sqlx::Error> {
    let query = "
        UPDATE 
            line_items
        SET 
            starting_balance = $1, 
            is_fund = true,
            fund_id = gen_random_uuid()
        WHERE 
            id = $2
        RETURNING fund_id
        ";

    let row = sqlx::query(query)
        .bind(starting_balance)
        .bind(line_item_id)
        .fetch_one(&state.db)
        .await?;

    let fund_id: String = row.get("fund_id");
    Ok(fund_id)
}

pub async fn update_fund(
    state: Data<AppState>,
    starting_balance: f64,
    line_item_id: String,
) -> Result<PgQueryResult, sqlx::Error> {
    let query = "
        UPDATE 
            line_items
        SET 
            starting_balance = $1
        WHERE 
            id = $2
        ";

    sqlx::query(query)
        .bind(starting_balance)
        .bind(line_item_id)
        .execute(&state.db)
        .await
}

pub async fn sync_fund(
    state: Data<AppState>,
    sync_fund_request: SyncFundRequest,
    fund_id: String,
) -> Result<PgQueryResult, sqlx::Error> {
    let query = "
        UPDATE 
            line_items AS li
        SET 
            starting_balance = starting_balance + $1
        FROM 
            budget_categories AS bc
        JOIN 
            budgets AS b
                ON bc.budget_id = b.id
        JOIN 
            budgets AS current_budget 
                ON current_budget.id = $2
        WHERE 
            li.budget_category_id = bc.id
            AND li.fund_id = $3
            AND (b.year > current_budget.year 
                OR (b.year = current_budget.year AND b.month_number > current_budget.month_number));
        ";

    sqlx::query(query)
        .bind(sync_fund_request.starting_balance_change)
        .bind(sync_fund_request.budget_id)
        .bind(fund_id)
        .execute(&state.db)
        .await
}
