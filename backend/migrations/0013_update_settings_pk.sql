-- Fix the `id` column type
ALTER TABLE settings
ALTER COLUMN id TYPE VARCHAR(100);

ALTER TABLE settings
ALTER COLUMN id SET NOT NULL;