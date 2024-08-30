use actix_web::{
    delete, post, put, web::{Data, Json, Path}, HttpResponse, Responder
};

use crate::{
    line_items::{line_items_models::{NewLineItem, UpdatedLineItem}, line_items_service::{add_line_item, delete_line_item, update_line_item}},
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
        Ok(new_line_item) => HttpResponse::Ok().json(new_line_item.id.to_string()),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

#[put("")]
pub async fn update_line_item_handler(
    state: Data<AppState>,
    body: Json<UpdatedLineItem>,
) -> impl Responder {
    let updated_line_item = body.into_inner();

    let update_line_item_result = update_line_item(state, updated_line_item).await;

    match update_line_item_result {
        Ok(_) => HttpResponse::Ok().json("Line item updated successfully"),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

#[delete("{line_item_id}")]
pub async fn delete_line_item_handler(
    state: Data<AppState>,
    params: Path<String>,
) -> impl Responder {
    let line_item_id = params.into_inner();

    let delete_line_item_result = delete_line_item(state, line_item_id).await;

    match delete_line_item_result {
        Ok(_) => HttpResponse::Ok().json("Line item deleted successfully"),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}  
