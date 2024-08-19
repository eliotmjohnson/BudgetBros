use actix_web::{ web::Data, Result};


use crate::AppState;

use super::transactions_models::{NewTransaction, Transaction};

pub async fn get_line_item_transactions(state: Data<AppState>, line_item_id: i64) -> Result<Vec<Transaction>, sqlx::Error> {
    let query = 
        "SELECT * 
        FROM transactions 
        WHERE line_item_id = $1";

    sqlx::query_as::<_, Transaction>(query)
        .bind(line_item_id)   
        .fetch_all(&state.db)
        .await
}

pub async fn get_all_transactions_between_dates(
    state: Data<AppState>,
    user_id: i64,
    start_date: String,
    end_date: String
) -> Result<Vec<Transaction>, sqlx::Error> {
    let query = 
        "SELECT * 
        FROM transactions 
        WHERE user_id = $1
        AND date 
        BETWEEN $2 AND $3";

    sqlx::query_as::<_, Transaction>(query)
        .bind(user_id)
        .bind(start_date)
        .bind(end_date)
        .fetch_all(&state.db)
        .await
}

pub async fn add_transaction(state: Data<AppState>, new_transaction: NewTransaction) -> Result<Transaction, sqlx::Error> {
    let query = 
        "INSERT INTO transactions 
        (title, merchant, amount, notes, date, line_item_id) 
        VALUES ($1, $2, $3, $4, $5, $6)";

    sqlx::query_as::<_, Transaction>(query)
        .bind(new_transaction.title)   
        .bind(new_transaction.merchant)   
        .bind(new_transaction.amount)   
        .bind(new_transaction.notes)   
        .bind(new_transaction.date)   
        .bind(new_transaction.line_item_id)   
        .fetch_one(&state.db)
        .await
}

pub async fn update_transaction(state: Data<AppState>, new_transaction: Transaction) -> Result<Transaction, sqlx::Error> {
    let query = 
        "UPDATE 
            transactions 
        SET 
            title = $1,
            merchant = $2,
            amount = $3,
            notes = $4,
            date = $5,        
        WHERE id = $6";

    sqlx::query_as::<_, Transaction>(query)
        .bind(new_transaction.title)   
        .bind(new_transaction.merchant)   
        .bind(new_transaction.amount)   
        .bind(new_transaction.notes)   
        .bind(new_transaction.date)   
        .bind(new_transaction.id)   
        .fetch_one(&state.db)
        .await
}

pub async fn delete_transaction(state: Data<AppState>, id: i64) -> Result<i64, sqlx::Error> {
    let query = 
        "DELETE FROM transactions
        WHERE id = $1";

    let _ = sqlx::query_as::<_, Transaction>(query)
                .bind(id)   
                .fetch_one(&state.db)
                .await;

    Ok(id)
}