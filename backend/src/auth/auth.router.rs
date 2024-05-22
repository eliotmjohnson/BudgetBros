use actix_web::web::{scope, ServiceConfig};

use super::auth_controllers;

pub fn auth_router(cfg: &mut ServiceConfig) {
    cfg.service(
        scope("")
            .service(auth_controllers::login_handler)
            .service(auth_controllers::register_user_handler)
            .service(auth_controllers::session_refresh)
    );
}