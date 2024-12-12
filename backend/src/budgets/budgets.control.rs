use crate::{
    budget_categories::{
        budget_categories_models::NewBudgetCategory,
        budget_categories_services::{copy_budget_category, update_budget_category_order},
    },
    budgets::{
        budgets_helper::{
            get_compiled_budget_data, sort_by_category_order, sort_by_line_item_order,
        },
        budgets_models::{BudgetResponseData, CopyBudget, NewBudget},
        budgets_services::{
            add_budget, copy_budget, delete_budget, get_available_budgets, get_budget,
            update_budget_income,
        },
    },
    line_items::{
        line_items_models::CopyLineItem,
        line_items_service::{copy_line_items, update_line_item_order},
    },
    AppState,
};
use actix_web::{
    delete, get, patch, post,
    web::{Data, Json, Path, Query},
    HttpResponse, Responder,
};
use serde::Deserialize;

use super::budgets_models::UpdateBudgetIncomeRequest;

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
                    paycheck_amount: None,
                    additional_income_amount: None,
                    budget_categories: [].to_vec(),
                }),
                _ => {
                    let is_new_budget = rows[0].budget_category_id.is_none();
                    HttpResponse::Ok().json(BudgetResponseData {
                        budget_id: Some(rows[0].budget_id.clone()),
                        month_number: query_params.month_number,
                        year: query_params.year,
                        paycheck_amount: rows[0].paycheck_amount,
                        additional_income_amount: rows[0].additional_income_amount,
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

#[get("/available/{user_id}")]
async fn get_available_budgets_handler(
    state: Data<AppState>,
    params: Path<String>,
    query: Query<QueryParams>,
) -> impl Responder {
    let user_id = params.into_inner();
    let query_params = query.into_inner();

    let get_available_budgets_result =
        get_available_budgets(state, user_id, query_params.month_number, query_params.year).await;

    match get_available_budgets_result {
        Ok(budgets) => HttpResponse::Ok().json(budgets),
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

#[patch("/{budget_id}")]
pub async fn update_budget_income_handler(
    state: Data<AppState>,
    params: Path<String>,
    body: Json<UpdateBudgetIncomeRequest>,
) -> impl Responder {
    let budget_id = params.into_inner();
    let body = body.into_inner();

    let update_budget_income_result = update_budget_income(state.clone(), budget_id, body).await;

    match update_budget_income_result {
        Ok(_) => HttpResponse::Ok().json("Successfully updated budget income"),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

#[post("/copy/{user_id}")]
pub async fn copy_budget_handler(
    state: Data<AppState>,
    params: Path<String>,
    body: Json<CopyBudget>,
) -> impl Responder {
    let user_id = params.into_inner();
    let body = body.into_inner();

    let (prev_month, prev_year) = if body.current_month_number != 1 {
        (body.current_month_number - 1, body.current_year)
    } else {
        (12, body.current_year - 1)
    };

    let budget = match get_budget(state.clone(), user_id.clone(), prev_month, prev_year).await {
        Ok(budget) => budget,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    let budget_id = match copy_budget(
        state.clone(),
        user_id.clone(),
        body.current_month_number,
        body.current_year,
        budget[0].category_order.clone(),
        budget[0].paycheck_amount.unwrap_or_default(),
        budget[0].additional_income_amount.unwrap_or_default(),
    )
    .await
    {
        Ok(budget_id) => budget_id,
        Err(err) => {
            return HttpResponse::InternalServerError()
                .json(format!("Error adding budget, {}", err.to_string()))
        }
    };

    let mut compiled_budget_data = get_compiled_budget_data(budget.clone());

    sort_by_category_order(&mut compiled_budget_data, &budget[0].category_order);

    let mut new_category_order: Vec<String> = Vec::new();
    for category in compiled_budget_data {
        let new_category = NewBudgetCategory {
            budget_id: budget_id.id.clone(),
            user_id: user_id.clone(),
            name: category.name,
            category_order: category.line_item_order.clone().unwrap_or_default(),
        };

        let budget_category_id = match copy_budget_category(state.clone(), new_category).await {
            Ok(budget_category_id) => budget_category_id,
            Err(err) => {
                return HttpResponse::InternalServerError()
                    .json(format!("Error adding budget category, {}", err.to_string()))
            }
        };
        new_category_order.push(budget_category_id.id.clone());

        let mut current_line_items = category.line_items.clone();
        if current_line_items.len() > 0 {
            sort_by_line_item_order(&mut current_line_items, category.line_item_order.clone());

            let new_line_items: Vec<CopyLineItem> = current_line_items
                .into_iter()
                .map(|line_item| CopyLineItem {
                    name: line_item.name,
                    is_fund: line_item.is_fund,
                    planned_amount: line_item.planned_amount,
                    budget_category_id: budget_category_id.id.clone(),
                    fund_id: line_item.fund_id,
                    starting_balance: if line_item.is_fund {
                        line_item.transactions.iter().fold(
                            line_item.starting_balance + line_item.planned_amount,
                            |acc, trx| {
                                if trx.is_income_transaction {
                                    acc + trx.amount
                                } else {
                                    acc - trx.amount
                                }
                            },
                        )
                    } else {
                        0.0
                    },
                })
                .collect();

            let new_line_item_ids = copy_line_items(state.clone(), new_line_items).await;
            if let Err(err) = new_line_item_ids {
                return HttpResponse::InternalServerError()
                    .json(format!("Error copying line items, {}", err.to_string()));
            }

            if let Err(err) = update_line_item_order(
                state.clone(),
                new_line_item_ids.unwrap(),
                budget_category_id.id.clone(),
            )
            .await
            {
                return HttpResponse::InternalServerError().body(err.to_string());
            };
        }
    }

    if let Err(err) =
        update_budget_category_order(state.clone(), new_category_order, budget_id.id.clone()).await
    {
        return HttpResponse::InternalServerError().body(err.to_string());
    };

    HttpResponse::Ok().json("Successfully Copied Budget")
}
