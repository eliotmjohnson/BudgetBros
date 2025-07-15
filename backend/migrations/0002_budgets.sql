CREATE TABLE budgets (
    id VARCHAR(100) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    month_number BIGINT NOT NULL,
    year BIGINT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);