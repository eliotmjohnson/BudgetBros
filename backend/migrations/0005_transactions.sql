CREATE TABLE transactions (
    id VARCHAR(100) PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR NOT NULL,
    merchant VARCHAR NOT NULL,
    amount FLOAT8 NOT NULL,
    notes TEXT,
    date TIMESTAMPTZ NOT NULL,
    line_item_id VARCHAR(100),
    deleted BOOLEAN,
    CONSTRAINT fk_line_item
        FOREIGN KEY(line_item_id) 
        REFERENCES line_items(id)
        ON DELETE SET NULL
);
