use actix_web::{get, web::Data, HttpResponse, Responder};

use crate::{users::users_services::get_all_users, AppState};

#[get("/")]
async fn get_all_users_handler(state: Data<AppState>) -> impl Responder {
    let users_result = get_all_users(state).await;

    match users_result
    {
        Ok(users) => HttpResponse::Ok().json(users),
        Err(e) => {
            println!("{}", e);
            HttpResponse::InternalServerError().finish()
        }
    }
}