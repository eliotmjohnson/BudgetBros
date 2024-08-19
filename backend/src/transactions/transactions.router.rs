use actix_web::web::{scope, ServiceConfig};

use super::transactions_controllers::{
    add_transaction_handler, 
    delete_transaction_handler, 
    get_all_transactions_between_dates_handler, 
    get_all_line_item_transactions_handler, 
    update_transaction_handler
};

pub fn transactions_router(cfg: &mut ServiceConfig) {
    cfg.service(
        scope("/transactions")
            .service(get_all_line_item_transactions_handler)
            .service(get_all_transactions_between_dates_handler)
            .service(add_transaction_handler)
            .service(update_transaction_handler)
            .service(delete_transaction_handler)
    );
}