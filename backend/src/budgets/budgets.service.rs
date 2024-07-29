use actix_web::web::Data;

use crate::AppState;

use super::budgets_models::Budget;

pub async fn get_budget(
    state: Data<AppState>,
    user_id: i64,
    month_number: i64,
    year: i64,
) -> Result<Budget, sqlx::Error> {
    return sqlx::query_as::<_, Budget>(
        "SELECT * FROM budgets
            WHERE user_id = $1 AND month_number = $2 AND year = $3",
    )
    .bind(user_id)
    .bind(month_number)
    .bind(year)
    .fetch_one(&state.db)
    .await;
}
