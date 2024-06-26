use actix_web::web::{scope, ServiceConfig};

use super::budget_categories_controllers::get_all_budget_categories_handler;

pub fn budget_categories_router(cfg: &mut ServiceConfig) {
    cfg.service(scope("budget_categories").service(get_all_budget_categories_handler));
}
