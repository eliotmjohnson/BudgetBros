use actix_web::{
    get,
    web::{Data, Path},
    HttpResponse, Responder,
};

use crate::{settings::settings_services::get_user_settings, AppState};

#[get("")]
async fn get_user_settings_handler(state: Data<AppState>, params: Path<String>) -> impl Responder {
    let user_id = params.into_inner();

    let settings_result = get_user_settings(state, user_id).await;

    match settings_result {
        Ok(settings) => HttpResponse::Ok().json(settings),
        Err(e) => {
            println!("{}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}
