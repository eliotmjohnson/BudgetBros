use actix_web::web::{scope, ServiceConfig};

use super::line_items_controllers::{
    add_line_item_handler, delete_line_item_handler, reorder_line_item_handler,
    update_fund_handler, update_line_item_handler,
};

pub fn line_items_router(cfg: &mut ServiceConfig) {
    cfg.service(
        scope("/line_items")
            .service(add_line_item_handler)
            .service(update_line_item_handler)
            .service(delete_line_item_handler)
            .service(reorder_line_item_handler)
            .service(update_fund_handler),
    );
}
