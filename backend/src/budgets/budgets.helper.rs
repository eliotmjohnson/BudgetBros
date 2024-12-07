use super::budgets_models::{
    BudgetCategoryDataConverted, BudgetCategoryDataMap, BudgetRowData, LineItemData,
    TransactionData,
};

use std::collections::HashMap;

pub fn get_compiled_budget_data(rows: Vec<BudgetRowData>) -> Vec<BudgetCategoryDataConverted> {
    let mut budget_categories_compiled: HashMap<String, BudgetCategoryDataMap> = HashMap::new();

    for row in rows {
        if let Some(budget_category_id) = row.budget_category_id {
            let budget_category = budget_categories_compiled
                .entry(budget_category_id.clone())
                .or_insert_with(|| BudgetCategoryDataMap {
                    budget_category_id,
                    name: row.budget_category_name.unwrap_or_default(),
                    line_item_order: Some(row.line_item_order.unwrap_or_default()),
                    budget_line_items: HashMap::new(),
                });

            if let Some(line_item_id) = row.line_item_id {
                let line_item = budget_category
                    .budget_line_items
                    .entry(line_item_id.clone())
                    .or_insert_with(|| LineItemData {
                        line_item_id,
                        name: row.line_item_name.unwrap_or_default(),
                        is_fund: row.is_fund.unwrap_or_default(),
                        starting_balance: row.starting_balance.unwrap_or_default(),
                        planned_amount: row.planned_amount.unwrap_or_default(),
                        fund_id: row.fund_id.unwrap_or_default(),
                        transactions: Vec::new(),
                    });

                if row.transaction_id.is_some() {
                    line_item.transactions.push(TransactionData {
                        transaction_id: row.transaction_id.unwrap_or_default(),
                        title: row.title.unwrap_or_default(),
                        merchant: row.merchant.unwrap_or_default(),
                        amount: row.amount.unwrap_or_default(),
                        notes: row.notes.unwrap_or_default(),
                        date: row.date.unwrap_or_default(),
                        is_income_transaction: row.is_income_transaction.unwrap_or(false),
                    });
                }
            }
        }
    }

    budget_categories_compiled
        .into_values()
        .map(|category| BudgetCategoryDataConverted {
            budget_category_id: category.budget_category_id,
            name: category.name,
            line_item_order: category.line_item_order,
            line_items: category.budget_line_items.into_values().collect(),
        })
        .collect()
}
