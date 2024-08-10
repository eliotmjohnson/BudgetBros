use actix_web::web::{scope, ServiceConfig};

use super::budgets_controllers::get_budget_data_handler;

pub fn budgets_router(cfg: &mut ServiceConfig) {
    cfg
        .service(
            scope("/budgets")
                .service(get_budget_data_handler)
        );
}
