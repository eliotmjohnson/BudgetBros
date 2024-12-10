use actix_web::web::{scope, ServiceConfig};

use super::budgets_controllers::{
    add_budget_handler, copy_budget_handler, delete_budget_handler, get_available_budgets_handler,
    get_budget_data_handler, update_budget_income_handler,
};

pub fn budgets_router(cfg: &mut ServiceConfig) {
    cfg.service(
        scope("/budgets")
            .service(get_budget_data_handler)
            .service(add_budget_handler)
            .service(delete_budget_handler)
            .service(update_budget_income_handler)
            .service(copy_budget_handler)
            .service(get_available_budgets_handler),
    );
}
