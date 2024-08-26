use actix_web::web::Data;

use crate::AppState;

use super::budget_categories_models::BudgetCategory;

pub async fn get_budget_categories_with_line_items(
    state: Data<AppState>,
    budget_id: i64,
    date: String
) -> Result<Vec<BudgetCategory>, sqlx::Error> {
    let query = "
        SELECT *
        FROM 
            budget_categories
        JOIN 
            line_items ON budget_categories.line_item_id = line_items.id
        WHERE 
            budget_id = $1
        AND 
            date = $2
    ";

    sqlx::query_as::<_, BudgetCategory>(query)
        .bind(budget_id)
        .bind(date)
        .fetch_all(&state.db)
        .await
}
