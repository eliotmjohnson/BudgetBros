import { LineItem } from './line-item';

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
