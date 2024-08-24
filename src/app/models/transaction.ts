export type Transaction = {
    transactionId: number;
    title: string;
    merchant: string;
    amount: number;
    notes: string;
    date: string;
    lineItemId: number;
    deleted: boolean;
};

export type IsolatedTransaction = Transaction & {
    budgetCategoryName: string;
};