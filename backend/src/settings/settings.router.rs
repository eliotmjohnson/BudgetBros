use actix_web::web::{scope, ServiceConfig};

use super::users_controllers::get_all_users_handler;

pub fn users_router(cfg: &mut ServiceConfig) {
    cfg.service(scope("/users").service(get_all_users_handler));
}
