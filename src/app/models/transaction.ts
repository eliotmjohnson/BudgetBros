export interface Transaction {
    transactionId: string;
    title: string;
    merchant: string | null;
    amount: number;
    notes: string;
    date: string;
    lineItemId: string;
    deleted: boolean;
    isIncomeTransaction: boolean;
}

export type NewTransaction = Omit<
    Transaction,
    'transactionId' | 'lineItemId'
> & {
    lineItemId: string;
    userId: string;
};

export type IsolatedTransaction = Transaction & {
    budgetCategoryName: string;
};
