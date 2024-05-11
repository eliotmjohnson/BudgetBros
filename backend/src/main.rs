use actix_web::{main, web::Data, App, HttpServer};
use dotenv::dotenv;
use sqlx::{Pool, Postgres, postgres::PgPoolOptions};
use std::io::Result;

pub struct AppState {
    db: Pool<Postgres>
}


#[main]
async fn main() -> Result<()> {
    let port = 8080;
    dotenv().ok();

    let db_url = std::env::var("DB_URL")
        .expect("DB_URL env var must be set"); 

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .expect("Failed to connect to database"); 

    println!("Dat Cockroach DB is connected, yo!");

    println!("Backend is gonna be lit!!!! #rustftw!!. Server running on port {}", port);

    HttpServer::new(move || {
        App::new()
            .app_data(Data::new( AppState { db: pool.clone() } ))
    })
        .bind(("127.0.0.1", port))?
        .workers(2)
        .run()
        .await
        
}

