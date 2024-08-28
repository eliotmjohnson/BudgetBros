use actix_web::web::{scope, ServiceConfig};

use super::line_items_controllers::add_line_item_handler;

pub fn line_items_router(cfg: &mut ServiceConfig) {
    cfg.service(scope("/line_items").service(add_line_item_handler));
}