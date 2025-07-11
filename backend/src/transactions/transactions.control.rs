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
    add_transactions, delete_transaction, get_all_transactions_between_dates,
    get_deleted_transactions, get_line_item_transactions, get_untracked_transactions,
    recover_transaction, soft_delete_transaction, soft_delete_transaction_bulk,
    update_transactions,
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

#[get("/deleted/{user_id}")]
pub async fn get_deleted_transactions_handler(
    state: Data<AppState>,
    params: Path<String>,
) -> impl Responder {
    let user_id = params.into_inner();
    let transactions_result = get_deleted_transactions(state, user_id).await;

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
    body: Json<Vec<NewTransaction>>,
) -> impl Responder {
    let new_transactions = body.into_inner();

    let add_transactions_result = add_transactions(state, new_transactions).await;

    match add_transactions_result {
        Ok(transactions) => {
            let new_transactions: Vec<IsolatedTransactionResponse> = transactions
                .iter()
                .map(|transaction| IsolatedTransactionResponse {
                    line_item_id: transaction.line_item_id.clone(),
                    transaction_id: transaction.id.clone(),
                    title: transaction.title.clone(),
                    amount: transaction.amount,
                    notes: transaction.notes.clone(),
                    date: transaction.date,
                    merchant: transaction.merchant.clone(),
                    budget_category_name: transaction.budget_category_name.clone(),
                    deleted: transaction.deleted,
                    is_income_transaction: transaction.is_income_transaction,
                })
                .collect();

            return HttpResponse::Ok().json(new_transactions);
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
    body: Json<Vec<UpdatedTransaction>>,
) -> impl Responder {
    let transactions = body.into_inner();

    let updated_transactions: Vec<_> = transactions
        .iter()
        .filter(|trx| !trx.transaction_id.is_empty() && !trx.deleted)
        .cloned()
        .collect();
    let update_result = update_transactions(state.clone(), updated_transactions).await;

    let post_transactions: Vec<NewTransaction> = transactions
        .iter()
        .filter(|trx| trx.transaction_id.is_empty())
        .map(|trx| NewTransaction {
            user_id: trx.user_id.clone(),
            title: trx.title.clone(),
            merchant: trx.merchant.clone(),
            amount: trx.amount,
            notes: trx.notes.clone(),
            date: trx.date.to_string(),
            line_item_id: trx.line_item_id.clone().unwrap(),
            deleted: trx.deleted,
            split_transaction_id: trx.split_transaction_id.clone(),
            is_income_transaction: trx.is_income_transaction,
        })
        .collect();
    let add_result = add_transactions(state.clone(), post_transactions).await;

    let remove_transactions: Vec<String> = transactions
        .iter()
        .filter(|trx| trx.deleted)
        .map(|trx| &trx.transaction_id)
        .cloned()
        .collect();

    let delete_result = soft_delete_transaction_bulk(state.clone(), remove_transactions).await;

    if update_result.is_ok() && add_result.is_ok() && delete_result.is_ok() {
        let new_transactions: Vec<IsolatedTransactionResponse> = add_result
            .unwrap()
            .iter()
            .map(|transaction| IsolatedTransactionResponse {
                line_item_id: transaction.line_item_id.clone(),
                transaction_id: transaction.id.clone(),
                title: transaction.title.clone(),
                amount: transaction.amount,
                notes: transaction.notes.clone(),
                date: transaction.date,
                merchant: transaction.merchant.clone(),
                budget_category_name: transaction.budget_category_name.clone(),
                deleted: transaction.deleted,
                is_income_transaction: transaction.is_income_transaction,
            })
            .collect();
        HttpResponse::Ok().json(new_transactions)
    } else {
        HttpResponse::InternalServerError().json("One or more operations failed")
    }
}

#[delete("/soft-delete/{transaction_id}")]
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

#[put("/recover/{transaction_id}")]
pub async fn recover_transaction_handler(
    state: Data<AppState>,
    params: Path<String>,
) -> impl Responder {
    let transaction_id = params.into_inner();

    let recovered_transaction_result = recover_transaction(state, transaction_id).await;

    match recovered_transaction_result {
        Ok(_) => HttpResponse::Ok().json("Transaction recovered successfully"),
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
