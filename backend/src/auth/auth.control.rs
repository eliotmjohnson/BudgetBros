use actix_web::{
    get, post,
    web::{Data, Json},
    HttpResponse, Responder,
};
use actix_web_httpauth::extractors::basic::BasicAuth;
use argonautica::{Hasher, Verifier};
use hmac::{Hmac, Mac};
use jwt::{SignWithKey, VerifyWithKey};
use sha2::Sha256;

use crate::{
    auth::auth_models::{LoginResponse, SessionData, TokenClaims},
    users::{
        users_models::NewUser,
        users_services::{create_user, get_auth_user_by_email, get_user_by_id},
    },
    AppState,
};

#[post("/session-refresh")]
async fn session_refresh(state: Data<AppState>, body: Json<SessionData>) -> impl Responder {
    let jwt_secret = std::env::var("JWT_SECRET").expect("JWT secret not found");
    let key: Hmac<Sha256> = Hmac::new_from_slice(jwt_secret.as_bytes()).unwrap();
    let req_body = body.into_inner();

    let email = req_body.email;
    let token_str = req_body.token;

    let claims: Result<TokenClaims, &str> =
        token_str.verify_with_key(&key).map_err(|_| "Invalid token");

    match claims {
        Ok(claims) => {
            let user_id = claims.id;

            match email {
                Some(email) => HttpResponse::Ok().json(LoginResponse {
                    id: user_id,
                    email,
                    token: token_str,
                }),
                None => {
                    let found_user = get_user_by_id(state, user_id).await;

                    match found_user {
                        Ok(user) => HttpResponse::Ok().json(LoginResponse {
                            id: user.id,
                            email: user.email,
                            token: token_str,
                        }),
                        Err(_) => HttpResponse::Unauthorized().json("User could not be found"),
                    }
                }
            }
        }
        Err(_) => HttpResponse::Unauthorized().json("Token is not valid"),
    }
}

#[post("/register")]
async fn register_user_handler(state: Data<AppState>, body: Json<NewUser>) -> impl Responder {
    let new_user = body.into_inner();
    let hash_secret = std::env::var("HASH_SECRET").expect("HASH_SECRET must be set!");
    let mut hasher = Hasher::default();

    let password_hash = hasher
        .with_password(new_user.password.clone())
        .with_secret_key(hash_secret)
        .hash()
        .unwrap();

    println!("password_hash: {}", password_hash);

    let create_user_result = create_user(state, new_user, password_hash).await;

    match create_user_result {
        Ok(created_user) => HttpResponse::Ok().json(created_user),
        Err(e) => HttpResponse::InternalServerError().json(format!("{:?}", e)),
    }
}

#[get("/login")]
async fn login_handler(state: Data<AppState>, credentials: BasicAuth) -> impl Responder {
    let jwt_secret: Hmac<Sha256> = Hmac::new_from_slice(
        std::env::var("JWT_SECRET")
            .expect("JWT_SECRET must be set!")
            .as_bytes(),
    )
    .unwrap();

    let username = credentials.user_id();
    let password = credentials.password();

    match password {
        None => HttpResponse::Unauthorized().json("Must provide password!"),
        Some(password) => {
            let found_user = get_auth_user_by_email(state, username).await;

            match found_user {
                Ok(user) => {
                    let hash_secret =
                        std::env::var("HASH_SECRET").expect("HASH_SECRET must be set!");
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

                        HttpResponse::Ok().json(LoginResponse {
                            id: user.id,
                            email: user.email,
                            token: token_str,
                        })
                    } else {
                        HttpResponse::Unauthorized().json("Incorrect password!")
                    }
                }
                Err(e) => HttpResponse::InternalServerError().json(format!(
                    "Incorrect login credentials or error logging in - {:?}",
                    e
                )),
            }
        }
    }
}
