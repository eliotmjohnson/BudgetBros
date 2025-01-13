use actix_web::web::{scope, ServiceConfig};

use super::settings_controllers::get_user_settings_handler;

pub fn settings_router(cfg: &mut ServiceConfig) {
    cfg.service(scope("/settings").service(get_user_settings_handler));
}
