export type BudgetItem = {
    itemTitle: string;
    plannedAmount: number;
    fund: boolean;
};

export type BudgetCategory = {
    name: string;
    budgetItems: BudgetItem[];
};
