CREATE TABLE settings (
    id VARCHAR(100) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id varchar(100) NOT NULL,
    settings_json TEXT NOT NULL
);

ALTER TABLE settings
ADD CONSTRAINT fk_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;