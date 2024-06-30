CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    month_number INTEGER NOT NULL,
    year INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);