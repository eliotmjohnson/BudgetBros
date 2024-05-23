use actix_web::web::{scope, ServiceConfig};

use super::auth_controllers::{
    login_handler,
    register_user_handler,
    session_refresh
};

pub fn auth_router(cfg: &mut ServiceConfig) {
    cfg.service(
        scope("")
            .service(login_handler)
            .service(register_user_handler)
            .service(session_refresh)
    );
}