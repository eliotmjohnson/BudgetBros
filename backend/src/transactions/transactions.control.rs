use actix_web::{get, web::{Data, Path, Query}, HttpResponse, Responder};
use serde::Deserialize;

use crate::AppState;

use super::transactions_services::{get_line_item_transactions, get_all_transactions_between_dates};

#[get("/{line_item_id}")]
async fn get_all_line_item_transactions_handler(
    state: Data<AppState>,
    params: Path<i64>,
) -> impl Responder {
    let line_item_id = params.into_inner();
    let transactions_result = get_line_item_transactions(state, line_item_id).await;

    match transactions_result {
        Ok(transactions) => HttpResponse::Ok().json(transactions),
        Err(e) => {
            println!("{}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

#[derive(Deserialize)]
pub struct QueryParams {
    start_date: String,
    end_date: String,
}

#[get("/{user_id}")]
async fn get_all_line_item_transactions_between_dates_handler(
    state: Data<AppState>,
    params: Path<i64>,
    query: Query<QueryParams>
) -> impl Responder {
    let user_id = params.into_inner();
    let query_params = query.into_inner();

    let transactions_result = get_all_transactions_between_dates(
        state, 
        user_id,
        query_params.start_date,
        query_params.end_date,
    ).await;

    match transactions_result {
        Ok(transactions) => HttpResponse::Ok().json(transactions),
        Err(e) => {
            println!("{}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}