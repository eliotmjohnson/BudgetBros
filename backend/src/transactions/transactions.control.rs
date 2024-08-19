use actix_web::{get, web::{Data, Path}, HttpResponse, Responder};

use crate::AppState;

use super::transactions_services::get_line_item_transactions;

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