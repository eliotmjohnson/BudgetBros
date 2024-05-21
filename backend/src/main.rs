use actix_cors::Cors;
use actix_web::web::{scope, Data};
use actix_web::{main, App, HttpServer};
use actix_web_httpauth::middleware::HttpAuthentication;
use dotenv::dotenv;
use sqlx::{postgres::PgPoolOptions, Pool, Postgres};

use crate::auth::auth_controllers;
use crate::auth::auth_middleware;
use crate::users::users_controllers;
mod users;
mod auth;

pub struct AppState {
    db: Pool<Postgres>,
}

const PORT: u16 = 8080;
const FE_URL: &str = "http://localhost:4200";

#[main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    let db_url = std::env::var("DB_URL").expect("DB_URL env var must be set");

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .expect("Failed to connect to database");

    sqlx::migrate!("./migrations")
        .set_locking(false)
        .run(&pool)
        .await
        .expect("Failed to migrate database");

    println!("Dat Cockroach DB is connected, yo!");
    println!(
        "Backend is gonna be lit!!!! #rustftw!!. Server running on port {}",
        PORT
    );

    HttpServer::new(move || {
        let _bearer_middleware = HttpAuthentication::bearer(auth_middleware::token_validator);

        App::new()
            .wrap(
                Cors::default()
                    .allowed_origin(FE_URL)
                    .allow_any_origin()
                    .allow_any_method()
                    .allow_any_header()
                    .supports_credentials(),
            )
            .app_data(Data::new(AppState { db: pool.clone() }))
            .service(
                scope("")
                .service(auth_controllers::login_handler)
                .service(auth_controllers::register_user_handler)
                .service(auth_controllers::session_refresh)
            )
            .service(
                scope("/users")
                .service(users_controllers::get_all_users_handler)
            )
    })
    .bind(("127.0.0.1", PORT))?
    .workers(2)
    .run()
    .await
}
