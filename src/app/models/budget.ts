import { BudgetCategory } from './budgetCategory';

export type Budget = {
    budgetId?: string;
    monthNumber: number;
    year: number;
    budgetCategories: BudgetCategory[];
};
