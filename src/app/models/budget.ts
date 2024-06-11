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
