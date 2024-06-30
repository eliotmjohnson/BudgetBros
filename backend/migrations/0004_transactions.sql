CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    merchant VARCHAR NOT NULL,
    amount FLOAT8 NOT NULL,
    notes TEXT,
    date TIMESTAMPTZ NOT NULL
    line_item_id INTEGER,
    CONSTRAINT fk_line_item
        FOREIGN KEY(line_item_id)
        REFERENCES line_items(id)
);