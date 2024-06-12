use actix_web::{
    get,
    web::{Data, Path},
    HttpResponse, Responder,
};

use crate::AppState;

use super::budget_categories_services::get_budget_categories;

#[get("/{user_id}")]
async fn get_all_budget_categories_handler(
    state: Data<AppState>,
    params: Path<i64>,
) -> impl Responder {
    println!("sup!!");
    let user_id = params.into_inner();
    let budget_categories_result = get_budget_categories(state, user_id).await;

    match budget_categories_result {
        Ok(budget_categories) => HttpResponse::Ok().json(budget_categories),
        Err(e) => {
            println!("{}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}
