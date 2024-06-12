use actix_web::web::{scope, ServiceConfig};



pub fn users_router(cfg: &mut ServiceConfig) {
    cfg.service(
        scope("/transactions")
    );
}