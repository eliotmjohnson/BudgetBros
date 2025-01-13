use serde::{Deserialize, Serialize};
use sqlx::{self, FromRow};

#[derive(Deserialize, FromRow, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    pub id: String,
}
