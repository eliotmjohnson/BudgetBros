-- Add the budget_id column
ALTER TABLE budget_categories
ADD COLUMN budget_id INTEGER;

-- Add the foreign key constraint to the budget_id column
ALTER TABLE budget_categories
ADD CONSTRAINT fk_budget
FOREIGN KEY (budget_id)
REFERENCES budgets(id);