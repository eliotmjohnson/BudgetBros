use actix_web::web::Data;

use crate::AppState;

use super::budget_categories_models::BudgetCategoryWithLineItemsRow;

pub async fn get_budget_categories_with_line_items(
    state: Data<AppState>,
    user_id: i64,
    month_number: i64,
    year: i64
) -> Result<Vec<BudgetCategoryWithLineItemsRow>, sqlx::Error> {
    let query = "
        SELECT 
            bc.id AS budget_category_id,
            bc.name AS budget_category_name,
            li.id AS line_item_id,
            li.name AS line_item_name
        FROM 
            budgets b
        JOIN 
            budget_categories bc ON b.id = bc.budget_id
        JOIN 
            line_items li ON bc.id = li.budget_category_id
        WHERE 
            b.user_id = $1 AND b.month_number = $2 AND b.year = $3
        ORDER BY
            bc.id, li.id;
    ";

    sqlx::query_as::<_, BudgetCategoryWithLineItemsRow>(query)
        .bind(user_id)
        .bind(month_number)
        .bind(year)
        .fetch_all(&state.db)
        .await
}
