use actix_web::{post, web::{Data, Json}, HttpResponse, Responder};
use hmac::{Hmac, Mac};
use sha2::Sha256;
use jwt::VerifyWithKey;

use crate::{
    auth::auth_models::{LoginResponse, SessionData, TokenClaims}, 
    users::users_services::get_user_by_id, AppState
};

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