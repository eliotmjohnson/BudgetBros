use actix_web::{get, web::Data, HttpResponse, Responder};
use actix_web_httpauth::extractors::basic::BasicAuth;
use argonautica::Verifier;
use hmac::{Hmac, Mac};
use jwt::SignWithKey;
use sha2::Sha256;

use crate::{models::user::AuthUser, AppState, TokenClaims};

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