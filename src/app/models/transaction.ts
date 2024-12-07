export interface Transaction {
    transactionId: string;
    title: string;
    merchant: string | null;
    amount: number;
    notes: string;
    date: string;
    lineItemId: string;
    userId: string;
    deleted: boolean;
    isIncomeTransaction: boolean;
}

export type NewTransaction = Omit<
    Transaction,
    'transactionId' | 'lineItemId'
> & { lineItemId: string };

export type IsolatedTransaction = Transaction & {
    budgetCategoryName: string;
};
