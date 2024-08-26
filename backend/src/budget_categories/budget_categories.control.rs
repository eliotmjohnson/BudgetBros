use actix_web::{
    get,
    web::{Data, Path, Query},
    HttpResponse, Responder,
};

use crate::{budget_categories::budget_categories_services::get_budget_categories_with_line_items, AppState};


pub struct QueryParams {
    date: Option<String>,
}

#[get("/{user_id}")]
async fn get_all_budget_categories_handler(
    state: Data<AppState>,
    params: Path<i64>,
    query: Query<QueryParams>
) -> impl Responder {
    let user_id = params.into_inner();
    let date = query.date.clone().expect("Date query param is missing");

    let budget_categories_result = 
        get_budget_categories_with_line_items(
            state, 
            user_id, 
            date
        ).await;

    match budget_categories_result {
        Ok(budget_categories) => HttpResponse::Ok().json(budget_categories),
        Err(e) => {
            println!("{}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}
