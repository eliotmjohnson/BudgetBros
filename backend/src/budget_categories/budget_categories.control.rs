use std::collections::HashMap;

use actix_web::{
    delete, get, patch, post,
    web::{Data, Json, Path, Query},
    HttpResponse, Responder,
};
use serde::Deserialize;

use crate::{
    budget_categories::{budget_categories_models::*, budget_categories_services::*},
    line_items::line_items_models::LineItemReduced,
    AppState,
};

#[derive(Deserialize)]
pub struct QueryParams {
    month_number: Option<i64>,
    year: Option<i64>,
}

#[get("/{user_id}")]
async fn get_all_budget_categories_with_line_items_handler(
    state: Data<AppState>,
    params: Path<String>,
    query: Query<QueryParams>,
) -> impl Responder {
    let user_id = params.into_inner();
    let query_params = query.into_inner();

    let month_number = query_params
        .month_number
        .expect("Month number query param missing");
    let year = query_params.year.expect("Year query param missing");

    let budget_categories_result =
        get_budget_categories_with_line_items(state, user_id, month_number, year).await;

    match budget_categories_result {
        Ok(budget_categories_rows) => {
            let mut categories_map: HashMap<String, BudgetCategoryWithLineItems> = HashMap::new();

            for row in budget_categories_rows {
                categories_map
                    .entry(row.budget_category_id.clone())
                    .or_insert_with(|| BudgetCategoryWithLineItems {
                        budget_category_id: row.budget_category_id,
                        budget_category_name: row.budget_category_name.clone(),
                        line_items: Vec::new(),
                    })
                    .line_items
                    .push(LineItemReduced {
                        line_item_id: row.line_item_id,
                        line_item_name: row.line_item_name,
                    });
            }

            let result: Vec<BudgetCategoryWithLineItems> = categories_map.into_values().collect();

            HttpResponse::Ok().json(result)
        }
        Err(e) => {
            println!("{}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}

#[post("")]
pub async fn add_budget_category_handler(
    state: Data<AppState>,
    body: Json<NewBudgetCategory>,
) -> impl Responder {
    let new_budget_category = body.into_inner();
    let budget_id = new_budget_category.budget_id.clone();
    let mut category_order = new_budget_category.category_order.clone();

    let add_budget_category_result =
        add_budget_category(state.clone(), new_budget_category.clone()).await;
    if let Err(_) = add_budget_category_result {
        return HttpResponse::InternalServerError().body("Failed to add new budget category");
    }

    let new_budget_category_result = add_budget_category_result.unwrap();
    category_order.push(new_budget_category_result.id.clone());

    let update_budget_category_order_result =
        update_budget_category_order(state, category_order, budget_id).await;
    if let Err(_) = update_budget_category_order_result {
        return HttpResponse::InternalServerError().body("Failed to update budget category order");
    }

    HttpResponse::Ok().json(new_budget_category_result.id.clone())
}

#[patch("")]
pub async fn update_budget_category_handler(
    state: Data<AppState>,
    body: Json<UpdatedBudgetCategory>,
) -> impl Responder {
    let updated_budget_category = body.into_inner();

    let update_budget_category_result =
        update_budget_category(state, updated_budget_category).await;

    match update_budget_category_result {
        Ok(_) => HttpResponse::Ok().json("Budget Category updated successfully"),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

#[delete("{budget_category_id}")]
pub async fn delete_budget_category_handler(
    state: Data<AppState>,
    body: Json<BudgetCategoryDeleteRequest>,
    params: Path<String>,
) -> impl Responder {
    let budget_category_id = params.into_inner();
    let body = body.into_inner();
    let mut category_order = body.category_order.clone();
    let budget_id = body.budget_id.clone();

    let delete_budget_category_result =
        delete_budget_category(state.clone(), budget_category_id.clone()).await;
    if let Err(_) = delete_budget_category_result {
        return HttpResponse::InternalServerError().body("Failed to delete budget category");
    }

    category_order.retain(|id| id != &budget_category_id);

    let update_budget_category_order_result =
        update_budget_category_order(state.clone(), category_order, budget_id).await;
    if let Err(_) = update_budget_category_order_result {
        return HttpResponse::InternalServerError().body("Failed to update budget category order");
    }

    HttpResponse::Ok().json("Budget category deleted successfully")
}

#[post("/reorder/{budget_id}")]
pub async fn reorder_budget_category_handler(
    state: Data<AppState>,
    body: Json<Vec<String>>,
    path: Path<String>,
) -> impl Responder {
    let budget_category_ids = body.into_inner();
    let budget_id = path.into_inner();

    let reorder_budget_category_result =
        update_budget_category_order(state, budget_category_ids, budget_id).await;

    match reorder_budget_category_result {
        Ok(budget_category_order) => HttpResponse::Ok().json(budget_category_order.category_order),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}
