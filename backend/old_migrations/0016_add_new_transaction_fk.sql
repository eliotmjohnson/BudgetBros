ALTER TABLE transactions 
ADD CONSTRAINT transactions_line_items_fk 
FOREIGN KEY (line_item_id) 
REFERENCES line_items(line_item_id) 
ON DELETE SET NULL;
