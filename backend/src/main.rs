use actix_web::{dev::ServiceRequest, error::Error, main, web::{self, Data}, App, HttpMessage, HttpServer, Result};
use actix_web_httpauth::{extractors::{
        bearer::{self, BearerAuth}, 
        AuthenticationError
    }, middleware::HttpAuthentication};
use dotenv::dotenv;
use hmac::{Mac, Hmac};
use jwt::VerifyWithKey;
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use sqlx::{Pool, Postgres, postgres::PgPoolOptions};

pub struct AppState {
    db: Pool<Postgres>
}

#[derive(Serialize, Deserialize, Clone)]
pub struct TokenClaims {
    id: i32,
}

async fn token_validator(req: ServiceRequest, credentials: BearerAuth) -> Result<ServiceRequest, (Error, ServiceRequest)> {
    let jwt_secret = std::env::var("JWT_SECRET").expect("JWT secret not found");
    let key: Hmac<Sha256> = Hmac::new_from_slice(jwt_secret.as_bytes()).unwrap();
    let token_string = credentials.token();

    let claims: Result<TokenClaims, &str> = token_string
        .verify_with_key(&key)
        .map_err(|_| "Invalid token");

    match claims {
        Ok(value) => {
            req.extensions_mut().insert(value);
            Ok(req)
        }
        Err(_) => {
            let config = req.app_data::<bearer::Config>().cloned().unwrap_or_default().scope("");

            Err((AuthenticationError::from(config).into(), req))
        }
    }
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

    println!("Dat Cockroach DB is connected, yo!");

    println!("Backend is gonna be lit!!!! #rustftw!!. Server running on port {}", port);

    HttpServer::new(move || {
        let bearer_middleware = HttpAuthentication::bearer(token_validator);

        App::new()
            .app_data(Data::new( AppState { db: pool.clone() } ))
            // .service(basic_auth) <- add back in when auth route done
            // .service(register_user) <- add in when route ready
    })
        .bind(("127.0.0.1", port))?
        .workers(2)
        .run()
        .await
        
}

