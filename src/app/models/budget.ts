export type Transaction = {
    name: string;
    amount: number;
};

export type BudgetItem = {
    itemTitle: string;
    plannedAmount: number;
    fund: boolean;
    transactions?: Transaction[];
};

export type BudgetCategory = {
    name: string;
    budgetItems: BudgetItem[];
};

export type Budget = {
    budgetId: number
    monthNumber: number
    year: number
    budgetCategories: BudgetCategory1[]
}

export type BudgetCategory1 = {
    budgetCategoryId: number
    name: string
    lineItems: LineItem[]
}

export type LineItem = {
    lineItemId: number
    name: string
    isFund: boolean
    plannedAmount: number
    startingBalance: number
    transactions: Transaction[]
}

export type Transaction1 = {
    transactionId: number
    title: string
    merchant: string
    amount: number
    notes: string
    date: string
}
