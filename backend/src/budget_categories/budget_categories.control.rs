use std::collections::HashMap;

use actix_web::{
    get,
    web::{Data, Path, Query},
    HttpResponse, Responder,
};
use serde::Deserialize;

use crate::{
    budget_categories::{
        budget_categories_models::BudgetCategoryWithLineItems, 
        budget_categories_services::get_budget_categories_with_line_items
    }, 
    line_items::line_items_models::LineItemReduced, 
    AppState
};

#[derive(Deserialize)]
pub struct QueryParams {
    month_number: Option<i64>,
    year: Option<i64>,
}

#[get("/{user_id}")]
async fn get_all_budget_categories_with_line_items_handler(
    state: Data<AppState>,
    params: Path<i64>,
    query: Query<QueryParams>
) -> impl Responder {
    let user_id = params.into_inner();
    let query_params = query.into_inner();

    let month_number = query_params.month_number.expect("Month number query param missing");
    let year = query_params.year.expect("Year query param missing");

    let budget_categories_result = 
        get_budget_categories_with_line_items(
            state, 
            user_id, 
            month_number,
            year
        ).await;

    match budget_categories_result {
        Ok(budget_categories_rows) => {
            let mut categories_map: HashMap<i64, BudgetCategoryWithLineItems> = HashMap::new();

            for row in budget_categories_rows {
                categories_map
                    .entry(row.budget_category_id)
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
        },
        Err(e) => {
            println!("{}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}
