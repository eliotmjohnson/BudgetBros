use actix_web::{get, web::Data, HttpResponse, Responder};
use crate::{models::user::User, AppState};

#[get("/users")]
async fn get_all_users(state: Data<AppState>) -> impl Responder {
    let users_result = 
        sqlx::query_as::<_, User>(
            "SELECT * FROM users"
        )   
        .fetch_all(&state.db)
        .await;

    match users_result
    {
        Ok(users) => HttpResponse::Ok().json(users),
        Err(e) => {
            println!("{}", e);
            return HttpResponse::InternalServerError().finish();
        }
    }
}