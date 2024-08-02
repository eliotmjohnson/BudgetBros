use std::collections::HashMap;

use actix_web::web::Data;

use crate::AppState;

use super::budgets_models::{
    BudgetCategoryDataConverted, BudgetCategoryDataMap, BudgetRowData, LineItemData,
    TransactionData,
};

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
        FROM budgets b
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

pub fn get_compiled_budget_data(rows: Vec<BudgetRowData>) -> Vec<BudgetCategoryDataConverted> {
    let mut budget_categories_compiled: HashMap<i64, BudgetCategoryDataMap> = HashMap::new();

    for row in rows {
        let budget_category = budget_categories_compiled
            .entry(row.budget_category_id)
            .or_insert_with(|| BudgetCategoryDataMap {
                budget_category_id: row.budget_category_id,
                name: row.budget_category_name,
                budget_line_items: HashMap::new(),
            });

        let line_item = budget_category
            .budget_line_items
            .entry(row.line_item_id)
            .or_insert_with(|| LineItemData {
                line_item_id: row.line_item_id,
                name: row.line_item_name,
                is_fund: row.is_fund,
                starting_balance: row.starting_balance,
                planned_amount: row.planned_amount,
                transactions: Vec::new(),
            });

        line_item.transactions.push(TransactionData {
            transaction_id: row.transaction_id,
            title: row.title,
            merchant: row.merchant,
            amount: row.amount,
            notes: row.notes,
            date: row.date,
        });
    }

    return budget_categories_compiled
        .into_values()
        .map(|category| BudgetCategoryDataConverted {
            budget_category_id: category.budget_category_id,
            name: category.name,
            budget_line_items: category.budget_line_items.into_values().collect(),
        })
        .collect();
}
