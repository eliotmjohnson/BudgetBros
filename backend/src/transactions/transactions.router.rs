use actix_web::web::{scope, ServiceConfig};



pub fn transactions_router(cfg: &mut ServiceConfig) {
    cfg.service(
        scope("/transactions")
    );
}