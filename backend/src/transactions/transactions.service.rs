use actix_web::{ web::Data, Result};
use sqlx::{postgres::PgQueryResult, Postgres, Transaction as SqlxTransaction};

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

pub async fn get_untracked_transactions(state: Data<AppState>, user_id: String) -> Result<Vec<Transaction>, sqlx::Error> {
    let query = 
        "SELECT * 
        FROM transactions 
        WHERE user_id = $1 
        AND line_item_id IS NULL";

    sqlx::query_as::<_, Transaction>(query)
        .bind(user_id)   
        .fetch_all(&state.db)
        .await
}

pub async fn get_deleted_transactions(state: Data<AppState>, user_id: String) -> Result<Vec<IsolatedTransaction>, sqlx::Error> {
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
            AND t.deleted = true";

    sqlx::query_as::<_, IsolatedTransaction>(query)
        .bind(user_id)   
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

pub async fn add_transactions(state: Data<AppState>, new_transactions: Vec<NewTransaction>) -> Result<Vec<IsolatedTransaction>, sqlx::Error> {
    let tx: SqlxTransaction<'_, Postgres> = state.db.begin().await?;
    let mut results = Vec::new();
    
    let query = 
        "WITH inserted_transaction AS (
            INSERT INTO transactions 
            (user_id, title, merchant, amount, notes, date, line_item_id, deleted, split_transaction_id, is_income_transaction) 
            VALUES ($1, $2, $3, $4, $5, $6::timestamptz, $7, $8, $9, $10)
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

    for new_transaction in new_transactions {
        let result = sqlx::query_as::<_, IsolatedTransaction>(query)
            .bind(new_transaction.user_id)
            .bind(new_transaction.title)   
            .bind(new_transaction.merchant)   
            .bind(new_transaction.amount)   
            .bind(new_transaction.notes)   
            .bind(new_transaction.date)   
            .bind(new_transaction.line_item_id)   
            .bind(new_transaction.deleted)
            .bind(new_transaction.split_transaction_id)
            .bind(new_transaction.is_income_transaction)
            .fetch_one(&state.db)
            .await;
 println!("{:?}", result);
        if result.is_ok() {
            results.push(result.unwrap());
        } else {
            continue;
        }
       
    }
    
    tx.commit().await?;
    Ok(results)
}

pub async fn update_transactions(
    state: Data<AppState>,
    updated_transactions: Vec<UpdatedTransaction>,
) -> Result<Vec<PgQueryResult>, sqlx::Error> {
    let mut tx: SqlxTransaction<'_, Postgres> = state.db.begin().await?;
    let mut results = Vec::new();

    let query = "
        UPDATE transactions 
        SET 
            title = $1,
            merchant = $2,
            amount = $3,
            notes = $4,
            date = $5,
            line_item_id = $6,
            split_transaction_id = $7,
            is_income_transaction = $8
        WHERE id = $9
    ";

    for t in updated_transactions {
        let result = sqlx::query(query)
            .bind(t.title)
            .bind(t.merchant)
            .bind(t.amount)
            .bind(t.notes)
            .bind(t.date)
            .bind(t.line_item_id)
            .bind(t.split_transaction_id)
            .bind(t.is_income_transaction)
            .bind(t.transaction_id)
            .execute(&mut *tx)
            .await?;
        results.push(result);
    }

    tx.commit().await?;
    Ok(results)
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

pub async fn soft_delete_transaction_bulk(
    state: Data<AppState>,
    ids: Vec<String>,
) -> Result<Vec<String>, sqlx::Error> {
    let query = r#"
        UPDATE 
            transactions 
        SET 
            deleted = true       
        WHERE 
            id = ANY($1)
    "#;

    let _ = sqlx::query(query)
        .bind(ids.clone()) // Binds Vec<String> to the ANY clause
        .execute(&state.db)
        .await?;

    Ok(ids)
}

pub async fn recover_transaction(state: Data<AppState>, id: String) -> Result<String, sqlx::Error> {
    let query = 
        "UPDATE 
            transactions 
        SET 
            deleted = false       
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