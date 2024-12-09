use actix_web::{
    delete, get, post, put,
    web::{Data, Json, Path, Query},
    HttpResponse, Responder,
};

use serde::Deserialize;

use crate::{
    transactions::transactions_models::{
        IsolatedTransactionResponse, NewTransaction, TransactionResponse, UpdatedTransaction,
    },
    AppState,
};

use super::transactions_services::{
    add_transaction, delete_transaction, get_all_transactions_between_dates,
    get_line_item_transactions, get_untracked_transactions, soft_delete_transaction,
    update_transaction,
};

#[get("/untracked/{user_id}")]
pub async fn get_untracked_transactions_handler(
    state: Data<AppState>,
    params: Path<String>,
) -> impl Responder {
    let user_id = params.into_inner();
    let transactions_result = get_untracked_transactions(state, user_id).await;

    match transactions_result {
        Ok(transactions) => {
            let transactions_response: Vec<TransactionResponse> = transactions
                .into_iter()
                .map(|transaction| TransactionResponse {
                    line_item_id: transaction.line_item_id.unwrap_or_default(),
                    transaction_id: transaction.id,
                    title: transaction.title,
                    amount: transaction.amount,
                    notes: transaction.notes.unwrap_or_default(),
                    date: transaction.date,
                    merchant: transaction.merchant,
                    deleted: transaction.deleted,
                    is_income_transaction: transaction.is_income_transaction,
                })
                .collect();
            HttpResponse::Ok().json(transactions_response)
        }
        Err(e) => {
            println!("{}", e);
            HttpResponse::InternalServerError().body(e.to_string())
        }
    }
}

#[get("/{line_item_id}")]
pub async fn get_all_line_item_transactions_handler(
    state: Data<AppState>,
    params: Path<String>,
) -> impl Responder {
    let line_item_id = params.into_inner();
    let transactions_result = get_line_item_transactions(state, line_item_id).await;

    match transactions_result {
        Ok(transactions) => HttpResponse::Ok().json(transactions),
        Err(e) => {
            println!("{}", e);
            HttpResponse::InternalServerError().body(e.to_string())
        }
    }
}

#[derive(Deserialize)]
pub struct QueryParams {
    start_date: String,
    end_date: String,
}

#[get("/{user_id}")]
pub async fn get_all_transactions_between_dates_handler(
    state: Data<AppState>,
    params: Path<String>,
    query: Query<QueryParams>,
) -> impl Responder {
    let user_id = params.into_inner();
    let query_params = query.into_inner();

    let transactions_result = get_all_transactions_between_dates(
        state,
        user_id,
        query_params.start_date,
        query_params.end_date,
    )
    .await;

    match transactions_result {
        Ok(transactions) => {
            let transactions_response: Vec<IsolatedTransactionResponse> = transactions
                .into_iter()
                .map(|transaction| IsolatedTransactionResponse {
                    line_item_id: transaction.line_item_id,
                    transaction_id: transaction.id,
                    title: transaction.title,
                    amount: transaction.amount,
                    notes: transaction.notes,
                    date: transaction.date,
                    merchant: transaction.merchant,
                    budget_category_name: transaction.budget_category_name,
                    deleted: transaction.deleted,
                    is_income_transaction: transaction.is_income_transaction,
                })
                .collect();

            HttpResponse::Ok().json(transactions_response)
        }
        Err(e) => {
            println!("{}", e);
            HttpResponse::InternalServerError().body(e.to_string())
        }
    }
}

#[post("")]
pub async fn add_transaction_handler(
    state: Data<AppState>,
    body: Json<NewTransaction>,
) -> impl Responder {
    let new_transaction = body.into_inner();

    let add_transaction_result = add_transaction(state, new_transaction).await;

    match add_transaction_result {
        Ok(transaction) => {
            let newly_added_transaction = IsolatedTransactionResponse {
                line_item_id: transaction.line_item_id,
                transaction_id: transaction.id,
                title: transaction.title,
                amount: transaction.amount,
                notes: transaction.notes,
                date: transaction.date,
                merchant: transaction.merchant,
                budget_category_name: transaction.budget_category_name,
                deleted: transaction.deleted,
                is_income_transaction: transaction.is_income_transaction,
            };
            HttpResponse::Ok().json(newly_added_transaction)
        }
        Err(e) => {
            println!("{}", e);
            HttpResponse::InternalServerError().body(e.to_string())
        }
    }
}

#[put("")]
pub async fn update_transaction_handler(
    state: Data<AppState>,
    body: Json<UpdatedTransaction>,
) -> impl Responder {
    let updated_transaction = body.into_inner();

    let updated_transaction_result = update_transaction(state, updated_transaction).await;

    match updated_transaction_result {
        Ok(_) => HttpResponse::Ok().json("Transaction updated successfully"),
        Err(e) => {
            println!("{}", e);
            HttpResponse::InternalServerError().body(e.to_string())
        }
    }
}

#[delete("/soft/{transaction_id}")]
pub async fn soft_delete_transaction_handler(
    state: Data<AppState>,
    params: Path<String>,
) -> impl Responder {
    let transaction_id = params.into_inner();

    let delete_transaction_result = soft_delete_transaction(state, transaction_id).await;

    match delete_transaction_result {
        Ok(_) => HttpResponse::Ok().json("Transaction deleted successfully"),
        Err(e) => {
            println!("{}", e);
            HttpResponse::InternalServerError().body(e.to_string())
        }
    }
}

#[delete("/{transaction_id}")]
pub async fn delete_transaction_handler(
    state: Data<AppState>,
    params: Path<String>,
) -> impl Responder {
    let transaction_id = params.into_inner();

    let delete_transaction_result = delete_transaction(state, transaction_id).await;

    match delete_transaction_result {
        Ok(_) => HttpResponse::Ok().json("Transaction deleted successfully"),
        Err(e) => {
            println!("{}", e);
            HttpResponse::InternalServerError().body(e.to_string())
        }
    }
}
