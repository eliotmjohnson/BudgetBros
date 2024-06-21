use actix_web::{web::Data, Result};

use crate::AppState;

use super::users_models::{AuthUser, NewUser, User};

pub async fn get_all_users(state: Data<AppState>) -> Result<Vec<User>, sqlx::Error> {
    sqlx::query_as::<_, User>("SELECT * FROM users")
        .fetch_all(&state.db)
        .await
}

pub async fn get_user_by_id(state: Data<AppState>, id: i64) -> Result<User, sqlx::Error> {
    sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(id)
        .fetch_one(&state.db)
        .await
}

pub async fn get_auth_user_by_email(
    state: Data<AppState>,
    username: &str,
) -> Result<AuthUser, sqlx::Error> {
    sqlx::query_as::<_, AuthUser>(
        "SELECT id, email, password 
        FROM users 
        WHERE email = $1",
    )
    .bind(username.to_string())
    .fetch_one(&state.db)
    .await
}

pub async fn create_user(
    state: Data<AppState>,
    new_user: NewUser,
    password_hash: String,
) -> Result<User, sqlx::Error> {
    sqlx::query_as::<_, User>(
        "INSERT INTO users (first_name, last_name, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id, first_name, last_name, email",
    )
    .bind(new_user.first_name)
    .bind(new_user.last_name)
    .bind(new_user.email)
    .bind(password_hash)
    .fetch_one(&state.db)
    .await
}
