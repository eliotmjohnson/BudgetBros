use actix_web::{ web::Data, Result};
use sqlx::postgres::PgQueryResult;


use crate::AppState;

use super::transactions_models::{IsolatedTransaction, NewTransaction, Transaction, UpdatedTransaction};

pub async fn get_line_item_transactions(state: Data<AppState>, line_item_id: String) -> Result<Vec<Transaction>, sqlx::Error> {
    let query = 
        "SELECT * 
        FROM 
            transactions 
        WHERE 
            line_item_id = $1
            AND deleted = false";

    sqlx::query_as::<_, Transaction>(query)
        .bind(line_item_id)   
        .fetch_all(&state.db)
        .await
}

pub async fn get_all_transactions_between_dates(
    state: Data<AppState>,
    user_id: String,
    start_date: String,
    end_date: String
) -> Result<Vec<IsolatedTransaction>, sqlx::Error> {
    let query = 
        "SELECT 
            t.*
            , bc.name as budget_category_name 
        FROM 
            transactions t
        JOIN 
            line_items li ON t.line_item_id = li.id
        JOIN 
            budget_categories bc ON li.budget_category_id = bc.id
        JOIN 
            budgets b ON bc.budget_id = b.id
        WHERE 
            b.user_id = $1 
            AND t.deleted = false
            AND t.date
            BETWEEN $2::timestamptz AND $3::timestamptz
        ORDER BY 
            t.date DESC";

    sqlx::query_as::<_, IsolatedTransaction>(query)
        .bind(user_id)
        .bind(start_date)
        .bind(end_date)
        .fetch_all(&state.db)
        .await
}

pub async fn add_transaction(state: Data<AppState>, new_transaction: NewTransaction) -> Result<IsolatedTransaction, sqlx::Error> {
    let query = 
        "WITH inserted_transaction AS (
            INSERT INTO transactions 
            (user_id, title, merchant, amount, notes, date, line_item_id, deleted) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        )
        SELECT 
            t.*, 
            bc.name as budget_category_name 
        FROM 
            inserted_transaction t
        JOIN 
            line_items li ON t.line_item_id = li.id
        JOIN 
            budget_categories bc ON li.budget_category_id = bc.id
        JOIN 
            budgets b ON bc.budget_id = b.id";

    sqlx::query_as::<_, IsolatedTransaction>(query)
        .bind(new_transaction.user_id)
        .bind(new_transaction.title)   
        .bind(new_transaction.merchant)   
        .bind(new_transaction.amount)   
        .bind(new_transaction.notes)   
        .bind(new_transaction.date)   
        .bind(new_transaction.line_item_id)   
        .bind(new_transaction.deleted)
        .fetch_one(&state.db)
        .await
}

pub async fn update_transaction(state: Data<AppState>, new_transaction: UpdatedTransaction) -> Result<PgQueryResult, sqlx::Error> {
    let query = 
        "UPDATE 
            transactions 
        SET 
            title = $1,
            merchant = $2,
            amount = $3,
            notes = $4,
            date = $5,
            line_item_id = $6      
        WHERE id = $7
    ";

    sqlx::query(query)
        .bind(new_transaction.title)   
        .bind(new_transaction.merchant)   
        .bind(new_transaction.amount)   
        .bind(new_transaction.notes)   
        .bind(new_transaction.date)   
        .bind(new_transaction.line_item_id)
        .bind(new_transaction.transaction_id)   
        .execute(&state.db)
        .await
}

pub async fn soft_delete_transaction(state: Data<AppState>, id: String) -> Result<String, sqlx::Error> {
    let query = 
        "UPDATE 
            transactions 
        SET 
            deleted = true       
        WHERE 
            id = $1";

    let _ = sqlx::query_as::<_, Transaction>(query)
                .bind(id.clone())   
                .fetch_one(&state.db)
                .await;

    Ok(id)
}

pub async fn delete_transaction(state: Data<AppState>, id: String) -> Result<String, sqlx::Error> {
    let query = 
        "DELETE FROM transactions
        WHERE id = $1";

    let _ = sqlx::query_as::<_, Transaction>(query)
                .bind(id.clone())   
                .fetch_one(&state.db)
                .await;

    Ok(id)
}