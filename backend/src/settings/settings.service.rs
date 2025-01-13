use actix_web::{web::Data, Result};

use crate::AppState;

use super::settings_models::Settings;

pub async fn get_user_settings(
    state: Data<AppState>,
    user_id: String,
) -> Result<Vec<Settings>, sqlx::Error> {
    let query = "SELECT * FROM settings WHERE user_id = $1";

    sqlx::query_as::<_, Settings>(query)
        .bind(user_id)
        .fetch_all(&state.db)
        .await
}
