use actix_web::{
    dev::ServiceRequest,
    get, post,
    web::{Data, Json},
    Error, HttpMessage, HttpResponse, Responder,
};
use actix_web_httpauth::extractors::{
    basic::BasicAuth,
    bearer::{self, BearerAuth},
    AuthenticationError,
};
use argonautica::{Hasher, Verifier};
use hmac::{Hmac, Mac};
use jwt::{SignWithKey, VerifyWithKey};
use serde::{Deserialize, Serialize};
use sha2::Sha256;

use crate::{
    models::user::{AuthUser, NewUser, User},
    AppState,
};

#[derive(Serialize, Deserialize, Clone)]
pub struct TokenClaims {
    id: i64,
}

#[derive(Serialize)]
pub struct LoginResponse {
    id: i64,
    email: String,
    token: String,
}

#[derive(Deserialize)]
pub struct SessionData {
    email: Option<String>,
    token: String,
}

#[post("/session-refresh")]
async fn session_refresh(state: Data<AppState>, body: Json<SessionData>) -> impl Responder {
    let jwt_secret = std::env::var("JWT_SECRET").expect("JWT secret not found");
    let key: Hmac<Sha256> = Hmac::new_from_slice(jwt_secret.as_bytes()).unwrap();
    let req_body = body.into_inner();

    let email = req_body.email;
    let token_str = req_body.token;

    let claims: Result<TokenClaims, &str> = token_str
        .verify_with_key(&key)
        .map_err(|_| "Invalid token");

    match claims {
        Ok(claims) => {
            let user_id = claims.id;

            match email {
                Some(email) => {
                    HttpResponse::Ok().json(LoginResponse {
                        id: user_id,
                        email,
                        token: token_str,
                    })
                }
                None => {
                    let found_user = sqlx::query_as::<_, AuthUser>(
                    "SELECT id, email, password 
                    FROM users 
                    WHERE id = $1",
                )
                .bind(user_id)
                .fetch_one(&state.db)
                .await;
    
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

pub async fn token_validator(
    req: ServiceRequest,
    credentials: BearerAuth,
) -> Result<ServiceRequest, (Error, ServiceRequest)> {
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
            let config = req
                .app_data::<bearer::Config>()
                .cloned()
                .unwrap_or_default()
                .scope("");

            Err((AuthenticationError::from(config).into(), req))
        }
    }
}

#[post("/register")]
async fn register_user(state: Data<AppState>, body: Json<NewUser>) -> impl Responder {
    let new_user = body.into_inner();
    let hash_secret = std::env::var("HASH_SECRET").expect("HASH_SECRET must be set!");
    let mut hasher = Hasher::default();

    let password_hash = hasher
        .with_password(new_user.password)
        .with_secret_key(hash_secret)
        .hash()
        .unwrap();

    println!("password_hash: {}", password_hash);

    let create_user_result = sqlx::query_as::<_, User>(
        "INSERT INTO users (first_name, last_name, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id, first_name, last_name, email",
    )
    .bind(new_user.first_name)
    .bind(new_user.last_name)
    .bind(new_user.email)
    .bind(password_hash)
    .fetch_one(&state.db)
    .await;

    match create_user_result {
        Ok(created_user) => HttpResponse::Ok().json(created_user),
        Err(e) => HttpResponse::InternalServerError().json(format!("{:?}", e)),
    }
}

#[get("/login")]
async fn login(state: Data<AppState>, credentials: BasicAuth) -> impl Responder {
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
            let found_user = sqlx::query_as::<_, AuthUser>(
                "SELECT id, email, password 
                FROM users 
                WHERE email = $1",
            )
            .bind(username.to_string())
            .fetch_one(&state.db)
            .await;

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
