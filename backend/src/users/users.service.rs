use actix_web::{web::Data, Result};

use crate::AppState;

use super::users_models::User;

pub async fn get_all_users(state: Data<AppState>) -> Result<Vec<User>, sqlx::Error> {
    let get_all_users_result = 
        sqlx::query_as::<_, User>(
            "SELECT * FROM users"
        )   
        .fetch_all(&state.db)
        .await;

    get_all_users_result
}

pub async fn get_user_by_id(state: Data<AppState>, id: i64) -> Result<User, sqlx::Error> {
    let get_user_by_id_result =
        sqlx::query_as::<_, User>(
            "SELECT * FROM users WHERE id = $1"
        )
        .bind(id)
        .fetch_one(&state.db)
        .await;

    get_user_by_id_result
}