ALTER TABLE transactions
ADD CONSTRAINT fk_line_item
FOREIGN KEY (line_item_id)
REFERENCES line_items(id)
ON DELETE SET NULL;