use actix_cors::Cors;
use actix_web::{web::Data, main, App, HttpServer, middleware::Logger};
use actix_web_httpauth::middleware::HttpAuthentication;
use dotenv::dotenv;
use env_logger::Env;
use sqlx::{postgres::PgPoolOptions, Pool, Postgres};

use crate::auth::auth_router::auth_router;
use crate::users::users_router::users_router;
use crate::auth::auth_middleware;
mod users;
mod auth;
mod transactions;

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

    // To configure req/res logging 
    env_logger::init_from_env(Env::default().default_filter_or("info"));

    HttpServer::new(move || {
        let _bearer_middleware = HttpAuthentication::bearer(auth_middleware::token_validator);

        App::new()
            .wrap(Logger::new("%r | %s | %t | %P | %T"))
            .wrap(
                Cors::default()
                    .allowed_origin(FE_URL)
                    .allow_any_origin()
                    .allow_any_method()
                    .allow_any_header()
                    .supports_credentials(),
            )
            .app_data(Data::new(AppState { db: pool.clone() }))
            .configure(auth_router)
            .configure(users_router)
    })
    .bind(("127.0.0.1", PORT))?
    .run()
    .await
}
