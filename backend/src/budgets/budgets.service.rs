use actix_web::web::Data;
use sqlx::postgres::PgQueryResult;

use crate::AppState;

use super::budgets_models::{BudgetId, BudgetRowData, UpdateBudgetIncomeRequest};

pub async fn get_budget(
    state: Data<AppState>,
    user_id: String,
    month_number: i64,
    year: i64,
) -> Result<Vec<BudgetRowData>, sqlx::Error> {
    let query = "
        SELECT 
            b.id AS budget_id,
            b.user_id,
            b.month_number,
            b.year,
            b.category_order,
            b.paycheck_amount,
            b.additional_income_amount,
            bc.id AS budget_category_id,
            bc.name AS budget_category_name,
            bc.line_item_order AS line_item_order,
            li.id AS line_item_id,
            li.name AS line_item_name,
            li.is_fund,
            li.planned_amount,
            li.starting_balance,
            li.fund_id,
            tr.id AS transaction_id,
            tr.title,
            tr.merchant,
            tr.amount,
            tr.notes,
            tr.date,
            tr.is_income_transaction
        FROM 
            budgets b
        LEFT JOIN 
            budget_categories bc ON b.id = bc.budget_id
        LEFT JOIN 
            line_items li ON bc.id = li.budget_category_id
        LEFT JOIN
            transactions tr ON li.id = tr.line_item_id
            AND (tr.deleted IS NULL OR tr.deleted = false)
        WHERE 
            b.user_id = $1 
            AND b.month_number = $2 
            AND b.year = $3
    ";

    sqlx::query_as::<_, BudgetRowData>(query)
        .bind(user_id)
        .bind(month_number)
        .bind(year)
        .fetch_all(&state.db)
        .await
}

pub async fn add_budget(
    state: Data<AppState>,
    user_id: String,
    month_number: i64,
    year: i64,
) -> Result<BudgetId, sqlx::Error> {
    let query = "INSERT INTO budgets
        (user_id, month_number, year)
        VALUES ($1, $2, $3)
        RETURNING id";

    sqlx::query_as::<_, BudgetId>(query)
        .bind(user_id)
        .bind(month_number)
        .bind(year)
        .fetch_one(&state.db)
        .await
}

pub async fn delete_budget(
    state: Data<AppState>,
    budget_id: String,
) -> Result<PgQueryResult, sqlx::Error> {
    let query = "
        DELETE FROM 
            budgets
        WHERE 
            id = $1
        ";

    sqlx::query(query).bind(budget_id).execute(&state.db).await
}

pub async fn update_budget_income(
    state: Data<AppState>,
    budget_id: String,
    body: UpdateBudgetIncomeRequest,
) -> Result<PgQueryResult, sqlx::Error> {
    let query = "
        UPDATE 
            budgets
        SET 
            paycheck_amount = $1,
            additional_income_amount = $2
        WHERE 
            id = $3
        ";

    sqlx::query(query)
        .bind(body.paycheck_amount)
        .bind(body.additional_income_amount)
        .bind(budget_id)
        .execute(&state.db)
        .await
}
