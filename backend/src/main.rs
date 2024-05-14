use actix_web::web::Data;
use actix_web::{main, App, HttpServer};
use actix_web_httpauth::middleware::HttpAuthentication;
use dotenv::dotenv;
use sqlx::{Pool, Postgres, postgres::PgPoolOptions};

use crate::services::users;
use crate::services::auth;
mod models;
mod services;

pub struct AppState {
    db: Pool<Postgres>
}

#[main]
async fn main() -> std::io::Result<()> {
    let port = 8080;
    dotenv().ok();

    let db_url = std::env::var("DB_URL")
        .expect("DB_URL env var must be set"); 

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

    println!("Backend is gonna be lit!!!! #rustftw!!. Server running on port {}", port);

    HttpServer::new(move || {
        let bearer_middleware = HttpAuthentication::bearer(auth::token_validator);

        App::new()
            .app_data(Data::new( AppState { db: pool.clone() } ))
            .service(users::get_all_users)
            .service(auth::login)
            // .service(login) <- add back in when auth route done
            // .service(register_user) <- add in when route ready
    })
        .bind(("127.0.0.1", port))?
        .workers(2)
        .run()
        .await
        
}

