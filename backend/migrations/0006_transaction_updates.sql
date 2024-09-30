ALTER TABLE transactions
ALTER COLUMN merchant DROP NOT NULL;

ALTER TABLE transactions
ADD user_id varchar(100) NOT NULL;

ALTER TABLE transactions
ADD CONSTRAINT transactions_users_fk 
    FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE;

