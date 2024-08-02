use crate::{
    budgets::{
        budgets_models::BudgetResponseData,
        budgets_services::get_budget,
        budgets_helper::get_compiled_budget_data
    },
    AppState,
};
use actix_web::{
    get,
    web::{Data, Path, Query},
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
    params: Path<i64>,
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
        Ok(rows) => HttpResponse::Ok().json(BudgetResponseData {
            budget_id: rows[0].budget_id,
            month_number: rows[0].month_number,
            year: rows[0].year,
            budget_categories: get_compiled_budget_data(rows),
        }),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}
