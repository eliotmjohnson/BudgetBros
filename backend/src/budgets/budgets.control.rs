use actix_web::{
    get,
    web::{Data, Path, Query},
    HttpResponse, Responder,
};
use serde::Deserialize;

use crate::{
    budget_categories::{
        budget_categories_models::BudgetCategory, budget_categories_services::get_budget_categories,
    },
    budgets::budgets_services::get_budget,
    AppState,
};

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
        Ok(budget) => {
            let budget_categories_result = get_budget_categories(state.clone(), budget.id)
                .await
                .unwrap_or_default();
            let mut budget_category_ids: Vec<i64> = [].to_vec();
            for budget_category in &budget_categories_result {
                budget_category_ids.push(budget_category.id);
            }
            println!(
                "Budget: {:?}, Budget Categories: {:?}",
                budget, budget_categories_result
            );

            HttpResponse::Ok().json("Yup")
        }
        Err(e) => {
            println!("{}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}
