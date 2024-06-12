use actix_web::web::Data;

use crate::AppState;

use super::budget_categories_models::BudgetCategory;

pub async fn get_budget_categories(
    state: Data<AppState>,
    user_id: i64,
) -> Result<Vec<BudgetCategory>, sqlx::Error> {
    sqlx::query_as::<_, BudgetCategory>(
        "SELECT * FROM budget_categories
            WHERE user_id = $1",
    )
    .bind(user_id)
    .fetch_all(&state.db)
    .await
}
