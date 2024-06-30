CREATE TABLE line_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_fund BOOLEAN NOT NULL,
    planned_amount FLOAT NOT NULL,
    starting_balance FLOAT NOT NULL,
    budget_category_id INTEGER NOT NULL,
    CONSTRAINT fk_budget_category
        FOREIGN KEY(budget_category_id) 
        REFERENCES budget_categories(id)
);