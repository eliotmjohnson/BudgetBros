ALTER TABLE transactions
ADD is_income_transaction boolean 
DEFAULT false NOT NULL;
