ALTER TABLE line_items 
ADD line_item_id uuid 
DEFAULT gen_random_uuid() 
NOT NULL;


