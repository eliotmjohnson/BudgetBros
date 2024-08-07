use actix_web::web::Data;

use crate::AppState;

use super::budgets_models::BudgetRowData;

pub async fn get_budget(
    state: Data<AppState>,
    user_id: i64,
    month_number: i64,
    year: i64,
) -> Result<Vec<BudgetRowData>, sqlx::Error> {
    let query = "
        SELECT 
            b.id AS budget_id,
            b.user_id,
            b.month_number,
            b.year,
            bc.id AS budget_category_id,
            bc.name AS budget_category_name,
            li.id AS line_item_id,
            li.name AS line_item_name,
            li.is_fund,
            li.planned_amount,
            li.starting_balance,
            tr.id AS transaction_id,
            tr.title,
            tr.merchant,
            tr.amount,
            tr.notes,
            tr.date
        FROM 
            budgets b
        JOIN 
            budget_categories bc ON b.id = bc.budget_id
        JOIN 
            line_items li ON bc.id = li.budget_category_id
        JOIN
            transactions tr ON li.id = tr.line_item_id 
        WHERE 
            b.user_id = $1 AND b.month_number = $2 AND b.year = $3
    ";

    sqlx::query_as::<_, BudgetRowData>(query)
        .bind(user_id)
        .bind(month_number)
        .bind(year)
        .fetch_all(&state.db)
        .await
}
