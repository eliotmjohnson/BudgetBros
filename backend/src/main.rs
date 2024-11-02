use actix_cors::Cors;
use actix_web::{main, middleware::Logger, web::Data, App, HttpServer};
use actix_web::{middleware, web, HttpResponse, Responder};
use actix_web_httpauth::middleware::HttpAuthentication;

use dotenv::dotenv;
use env_logger::Env;
use sqlx::{postgres::PgPoolOptions, Pool, Postgres};
use transactions::transactions_router::transactions_router;

use crate::auth::auth_middleware;
use crate::auth::auth_router::auth_router;
use crate::budget_categories::budget_categories_router::budget_categories_router;
use crate::budgets::budgets_router::budgets_router;
use crate::line_items::line_items_router::line_items_router;
use crate::users::users_router::users_router;

mod auth;
mod budget_categories;
mod budgets;
mod line_items;
mod transactions;
mod users;

pub struct AppState {
    db: Pool<Postgres>,
}

const PORT: u16 = 8080;
const FE_URL: &str = "http://localhost:4200";

async fn health_check() -> impl Responder {
    HttpResponse::Ok().body("OK")
}

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
        let bearer_middleware = HttpAuthentication::bearer(auth_middleware::token_validator);

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
            .wrap(middleware::NormalizePath::trim())
            .app_data(Data::new(AppState { db: pool.clone() }))
            .route("/health", web::get().to(health_check))
            .service(
                web::scope("/api")
                    .wrap(bearer_middleware)
                    .configure(budgets_router)
                    .configure(users_router)
                    .configure(budget_categories_router)
                    .configure(transactions_router)
                    .configure(line_items_router),
            )
            .configure(auth_router)
    })
    .bind(("0.0.0.0", PORT))?
    .run()
    .await
}
