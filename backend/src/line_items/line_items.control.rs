use actix_web::{
    post,
    web::{Data, Json},
    HttpResponse, Responder,
};

use crate::{
    line_items::{line_items_models::NewLineItem, line_items_service::add_line_item},
    AppState,
};

#[post("")]
pub async fn add_line_item_handler(
    state: Data<AppState>,
    body: Json<NewLineItem>,
) -> impl Responder {
    let new_line_item = body.into_inner();

    let add_line_item_result = add_line_item(state, new_line_item).await;

    match add_line_item_result {
        Ok(_) => HttpResponse::Ok().json("Line item added successfully"),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}
