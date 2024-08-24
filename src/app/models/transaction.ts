export type Transaction = {
    id: number;
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