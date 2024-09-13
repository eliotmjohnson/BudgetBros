CREATE TABLE line_items (
    id VARCHAR(100) PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    is_fund BOOLEAN NOT NULL,
    planned_amount FLOAT NOT NULL,
    starting_balance FLOAT NOT NULL,
    budget_category_id VARCHAR(100) NOT NULL,
    FOREIGN KEY (budget_category_id) 
        REFERENCES budget_categories(id) 
        ON DELETE CASCADE
);