use actix_web::{
    delete, patch, post, put,
    web::{Data, Json, Path},
    HttpResponse, Responder,
};

use crate::{
    line_items::{
        line_items_models::{
            LineItemDeleteRequest, NewLineItem, UpdateFundRequest, UpdatedLineItem,
        },
        line_items_service::{
            add_fund, add_line_item, delete_line_item, update_fund, update_line_item,
            update_line_item_order,
        },
    },
    AppState,
};

#[post("")]
pub async fn add_line_item_handler(
    state: Data<AppState>,
    body: Json<NewLineItem>,
) -> impl Responder {
    let new_line_item = body.into_inner();
    let mut line_item_order = new_line_item.line_item_order.clone();

    let add_line_item_result = add_line_item(state.clone(), new_line_item.clone()).await;
    if let Err(_) = add_line_item_result {
        return HttpResponse::InternalServerError().body("Failed to add new line item");
    }

    let new_line_item_result = add_line_item_result.unwrap();
    line_item_order.push(new_line_item_result.id.clone());

    let update_line_item_order_result = update_line_item_order(
        state.clone(),
        line_item_order,
        new_line_item.budget_category_id.clone(),
    )
    .await;
    if let Err(_) = update_line_item_order_result {
        return HttpResponse::InternalServerError().body("Failed to update line item order");
    }

    HttpResponse::Ok().json(new_line_item_result.id.clone())
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
    body: Json<LineItemDeleteRequest>,
    params: Path<String>,
) -> impl Responder {
    let line_item_id = params.into_inner();
    let body = body.into_inner();
    let mut line_item_order = body.line_item_order.clone();
    let budget_category_id = body.budget_category_id.clone();

    let delete_line_item_result = delete_line_item(state.clone(), line_item_id.clone()).await;
    if let Err(_) = delete_line_item_result {
        return HttpResponse::InternalServerError().body("Failed to delete line item");
    }

    line_item_order.retain(|id| id != &line_item_id);

    let update_line_item_order_result =
        update_line_item_order(state.clone(), line_item_order, budget_category_id).await;
    if let Err(_) = update_line_item_order_result {
        return HttpResponse::InternalServerError().body("Failed to update line item order");
    }

    HttpResponse::Ok().json("Line item deleted successfully")
}

#[post("/reorder/{budget_category_id}")]
pub async fn reorder_line_item_handler(
    state: Data<AppState>,
    body: Json<Vec<String>>,
    path: Path<String>,
) -> impl Responder {
    let line_item_ids = body.into_inner();
    let budget_category_id = path.into_inner();

    let reorder_line_item_result =
        update_line_item_order(state, line_item_ids, budget_category_id).await;

    match reorder_line_item_result {
        Ok(_) => HttpResponse::Ok().json("Line Items Reordered successfully"),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

#[patch("/fund/{line_item_id}")]
pub async fn update_fund_handler(
    state: Data<AppState>,
    body: Json<UpdateFundRequest>,
    path: Path<String>,
) -> impl Responder {
    let update_fund_request = body.into_inner();
    let line_item_id = path.into_inner();

    let result = if update_fund_request.is_adding_fund {
        add_fund(state, update_fund_request.starting_balance, line_item_id)
            .await
            .map(|fund_id| HttpResponse::Ok().json(fund_id))
    } else {
        update_fund(state, update_fund_request.starting_balance, line_item_id)
            .await
            .map(|_| HttpResponse::Ok().json("Fund Updated Successfully"))
    };

    match result {
        Ok(response) => response,
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}
