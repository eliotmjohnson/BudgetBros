export type Transaction = {
    id: string;
    title: string;
    merchant: string;
    amount: number;
    notes: string;
    date: string;
    lineItemId: string;
    deleted: boolean;
};

export type NewTransaction = Omit<Transaction, 'id' | 'lineItemId'> & {
    lineItemId: string;
};

export type IsolatedTransaction = Transaction & {
    budgetCategoryName: string;
};
