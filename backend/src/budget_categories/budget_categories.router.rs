use actix_web::web::{scope, ServiceConfig};

use super::budget_categories_controllers::{
    add_budget_category_handler, delete_budget_category_handler,
    get_all_budget_categories_with_line_items_handler, reorder_budget_category_handler,
    update_budget_category_handler,
};

pub fn budget_categories_router(cfg: &mut ServiceConfig) {
    cfg.service(
        scope("budget-categories")
            .service(get_all_budget_categories_with_line_items_handler)
            .service(add_budget_category_handler)
            .service(delete_budget_category_handler)
            .service(update_budget_category_handler)
            .service(reorder_budget_category_handler),
    );
}
