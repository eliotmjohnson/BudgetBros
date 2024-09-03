use actix_web::web::Data;
use sqlx::postgres::PgQueryResult;

use crate::AppState;

use super::budget_categories_models::{
    BudgetCategoryWithLineItemsRow, NewBudgetCategory, NewBudgetCategoryId,
};

pub async fn get_budget_categories_with_line_items(
    state: Data<AppState>,
    user_id: i64,
    month_number: i64,
    year: i64,
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

pub async fn add_budget_category(
    state: Data<AppState>,
    new_budget_category: NewBudgetCategory,
) -> Result<NewBudgetCategoryId, sqlx::Error> {
    let query = "INSERT INTO budget_categories
        (name, user_id, budget_id)
        VALUES ($1, $2, $3)
        RETURNING id";

    sqlx::query_as::<_, NewBudgetCategoryId>(query)
        .bind(new_budget_category.name)
        .bind(new_budget_category.user_id.parse::<i64>().unwrap())
        .bind(new_budget_category.budget_id.parse::<i64>().unwrap())
        .fetch_one(&state.db)
        .await
}

pub async fn delete_budget_category(
    state: Data<AppState>,
    budget_category_id: String,
) -> Result<PgQueryResult, sqlx::Error> {
    let query = "
        DELETE FROM 
            budget_categories
        WHERE 
            id = $1::int
        ";

    sqlx::query(query)
        .bind(budget_category_id)
        .execute(&state.db)
        .await
}
