ALTER TABLE line_items
DROP CONSTRAINT line_items_pkey;

ALTER TABLE line_items 
ADD CONSTRAINT line_items_pk 
PRIMARY KEY (line_item_id);