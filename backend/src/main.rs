use actix_web::{main, web::Data, App, HttpServer};
use dotenv::dotenv;
use sqlx::{Pool, Postgres};

pub struct AppState {
    db: Pool<Postgres>
}


#[main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    // let db_url = std::env::var("DB_URL").expect("DB_URL must be set"); <- add in when we have a db url
    // let pool = sqlx::postgres::PgPoolOptions::new()
    //     .max_connections(5)
    //     .connect(&db_url)
    //     .await
    //     .expect("Failed to connect to database"); <- add in when we have a db url

    let port = 8080;
    println!("Backend is gonna be lit!!!! #rustftw. Server running on port {}", port);

    HttpServer::new(move || {
        App::new()
            // .app_data(Data::new( AppState { db: pool.clone() })) <- add this in when we have a db url
    })
        .bind(("127.0.0.1", port))?
        .workers(2)
        .run()
        .await
        
}

