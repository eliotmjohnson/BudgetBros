use crate::{
    budgets::{
        budgets_helper::get_compiled_budget_data,
        budgets_models::{BudgetResponseData, NewBudget},
        budgets_services::{add_budget, delete_budget, get_budget},
    },
    AppState,
};
use actix_web::{
    delete, get, post,
    web::{Data, Json, Path, Query},
    HttpResponse, Responder,
};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct QueryParams {
    month_number: i64,
    year: i64,
}

#[get("/{user_id}")]
async fn get_budget_data_handler(
    state: Data<AppState>,
    params: Path<String>,
    query: Query<QueryParams>,
) -> impl Responder {
    let user_id = params.into_inner();
    let query_params = query.into_inner();
    let get_budget_result = get_budget(
        state.clone(),
        user_id,
        query_params.month_number,
        query_params.year,
    )
    .await;

    match get_budget_result {
        Ok(rows) =>
        // Need to decide what we send back if no budget or rows exist
        {
            match rows.len() {
                0 => HttpResponse::Ok().json(BudgetResponseData {
                    budget_id: None,
                    month_number: query_params.month_number,
                    year: query_params.year,
                    category_order: vec![],
                    budget_categories: [].to_vec(),
                }),
                _ => {
                    let is_new_budget = rows[0].budget_category_id.is_none();
                    HttpResponse::Ok().json(BudgetResponseData {
                        budget_id: Some(rows[0].budget_id.clone()),
                        month_number: query_params.month_number,
                        year: query_params.year,
                        category_order: rows[0].category_order.clone(),
                        budget_categories: if is_new_budget {
                            [].to_vec()
                        } else {
                            get_compiled_budget_data(rows)
                        },
                    })
                }
            }
        }
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

#[post("/{user_id}")]
pub async fn add_budget_handler(
    state: Data<AppState>,
    params: Path<String>,
    body: Json<NewBudget>,
) -> impl Responder {
    let user_id = params.into_inner();
    let body = body.into_inner();

    let add_budget_result = add_budget(state.clone(), user_id, body.month_number, body.year).await;

    match add_budget_result {
        Ok(budget_id) => HttpResponse::Ok().json(budget_id.id),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

#[delete("/{budget_id}")]
pub async fn delete_budget_handler(state: Data<AppState>, params: Path<String>) -> impl Responder {
    let budget_id = params.into_inner();

    let delete_budget_result = delete_budget(state, budget_id).await;

    match delete_budget_result {
        Ok(_) => HttpResponse::Ok().json("Budget deleted successfully"),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}
