export type Budget = {
    budgetId: number;
    monthNumber: number;
    year: number;
    budgetCategories: BudgetCategory[];
};

export type BudgetCategory = {
    budgetCategoryId: number;
    name: string;
    lineItems: LineItem[];
};

export type LineItem = {
    lineItemId: number;
    name: string;
    isFund: boolean;
    plannedAmount: number;
    startingBalance: number;
    transactions: Transaction[];
};

export type Transaction = {
    transactionId: number;
    title: string;
    merchant: string;
    amount: number;
    notes: string;
    date: string;
};
