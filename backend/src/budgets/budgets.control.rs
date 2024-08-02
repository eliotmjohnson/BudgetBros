use std::collections::HashMap;

use actix_web::{
    get,
    web::{Data, Path, Query},
    HttpResponse, Responder,
};
use serde::Deserialize;

use crate::{
    budgets::{budgets_models::{BudgetCategoryData, BudgetResponseData, LineItemData, TransactionData}, budgets_services::get_budget}, AppState
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
        Ok(rows) => {
            // Assuming the first row contains the budget_id, month_number, and year
            let mut budget = BudgetResponseData {
                budget_id: rows[0].budget_id,
                month_number: rows[0].month_number,
                year: rows[0].year,
                budget_categories: Vec::new(),
            };

            let mut budget_categories_map: HashMap<i64, BudgetCategoryData> = HashMap::new();
            let mut line_items_map: HashMap<i64, LineItemData> = HashMap::new();

            // let mut line_items_arr: Vec<LineItemData> = Vec::new();
            // let mut budget_categories_arr: Vec<BudgetCategoryData> = Vec::new();
            // for row in rows {
            //     let budget_cat_obj = BudgetCategoryData {
            //         id: category_id,
            //         name: row.budget_category_name.clone(),
            //         budget_line_items: Vec::new(),
            //     };

            //     let line_item_obj = LineItemData {
            //         line_item_id: item_id,
            //         name: row.line_item_name.clone(),
            //         is_fund: row.is_fund,
            //         starting_balance: row.starting_balance,
            //         planned_amount: row.planned_amount,
            //         transactions: Vec::new(),
            //     };
            // }

            for row in rows {
                let transaction = TransactionData {
                    transaction_id: row.transaction_id,
                    title: row.title,
                    merchant: row.merchant,
                    amount: row.amount,
                    notes: row.notes,
                    date: row.date,
                };

                let item_id: i64 = row.line_item_id;
                line_items_map
                    .entry(item_id)
                    .or_insert_with(|| LineItemData {
                        line_item_id: item_id,
                        name: row.line_item_name.clone(),
                        is_fund: row.is_fund,
                        starting_balance: row.starting_balance,
                        planned_amount: row.planned_amount,
                        transactions: Vec::new(),
                    });
                
                let mut line_item = line_items_map.get(&item_id).unwrap().clone();

                line_item.transactions.push(transaction);

                let category_id: i64 = row.budget_category_id;
                let category = budget_categories_map
                    .entry(category_id)
                    .or_insert_with(|| BudgetCategoryData {
                        id: category_id,
                        name: row.budget_category_name.clone(),
                        budget_line_items: Vec::new(),
                    });

                category.budget_line_items.push(line_item);
            }

            budget.budget_categories = budget_categories_map.into_values().collect();

            HttpResponse::Ok().json(budget)
        }
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}
