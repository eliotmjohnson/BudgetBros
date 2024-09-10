import { BudgetCategory } from './budgetCategory';

export interface Budget {
    budgetId?: string;
    monthNumber: number;
    year: number;
    budgetCategories: BudgetCategory[];
}
