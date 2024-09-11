ALTER TABLE line_items
ADD CONSTRAINT fk_budget_category
FOREIGN KEY (budget_category_id)
REFERENCES budget_categories(id)
ON DELETE CASCADE;