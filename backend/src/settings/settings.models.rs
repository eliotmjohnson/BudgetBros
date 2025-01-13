use serde::{Deserialize, Serialize};
use sqlx::{self, FromRow};

#[derive(Serialize, Deserialize, FromRow, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    pub id: String,
    pub user_id: String,
    pub settings: String,
    pub created_at: String,
    pub updated_at: String,
}
