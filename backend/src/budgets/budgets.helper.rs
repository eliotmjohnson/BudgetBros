use super::budgets_models::{
    BudgetCategoryDataConverted, BudgetCategoryDataMap, BudgetRowData, LineItemData,
    TransactionData,
};

use std::collections::HashMap;

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

    budget_categories_compiled
        .into_values()
        .map(|category| BudgetCategoryDataConverted {
            budget_category_id: category.budget_category_id,
            name: category.name,
            line_items: category.budget_line_items.into_values().collect(),
        })
        .collect()
}