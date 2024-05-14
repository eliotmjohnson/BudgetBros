use actix_web::{dev::ServiceRequest, get, web::Data, Error, HttpMessage, HttpResponse, Responder};
use actix_web_httpauth::extractors::{basic::BasicAuth, bearer::{self, BearerAuth}, AuthenticationError};
use argonautica::Verifier;
use hmac::{Hmac, Mac};
use jwt::{SignWithKey, VerifyWithKey};
use serde::{Deserialize, Serialize};
use sha2::Sha256;

use crate::{models::user::AuthUser, AppState};

#[derive(Serialize, Deserialize, Clone)]
pub struct TokenClaims {
    id: i32,
}

pub async fn token_validator(req: ServiceRequest, credentials: BearerAuth) -> Result<ServiceRequest, (Error, ServiceRequest)> {
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

#[get("/login")]
async fn login(state: Data<AppState>, credentials: BasicAuth) -> impl Responder {
    let jwt_secret: Hmac<Sha256> = Hmac::new_from_slice(
        std::env::var("JWT_SECRET")
            .expect("JWT_SECRET must be set!")
            .as_bytes()
    ).unwrap();

    let username = credentials.user_id();
    let password = credentials.password();

    match password {
        None => {
            return HttpResponse::Unauthorized().json("Must provide password!");
        }
        Some(password) => {
            let found_user = sqlx::query_as::<_, AuthUser>(
                "SELECT id, email, password 
                FROM users 
                WHERE email = $1"
            )
                .bind(username.to_string())
                .fetch_one(&state.db)
                .await;

            match found_user {
                Ok(user) => {
                    let hash_secret = std::env::var("HASH_SECRET").expect("HASH_SECRET must be set!");
                    let mut verifier = Verifier::default();

                    let is_valid = verifier
                        .with_hash(user.password)
                        .with_password(password)
                        .with_secret_key(hash_secret)
                        .verify()
                        .unwrap();

                    if is_valid {
                        let claims = TokenClaims { id: user.id };
                        let token_str = claims.sign_with_key(&jwt_secret).unwrap();

                        HttpResponse::Ok().json(token_str)
                    } else {
                        HttpResponse::Unauthorized().json("Incorrect username or password!")
                    }
                }
                Err(e) => HttpResponse::InternalServerError().json(format!("{:?}", e))
            }
        }
    }
}