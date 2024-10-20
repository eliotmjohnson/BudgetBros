import { BudgetCategory } from './budgetCategory';

export interface Budget {
    budgetId?: string;
    monthNumber: number;
    year: number;
    categoryOrder: string[];
    paycheckAmount: number | null;
    additionalIncomeAmount: number | null;
    budgetCategories: BudgetCategory[];
}

export interface UpdateBudgetIncomePayload {
    paycheckAmount: number;
    additionalIncomeAmount: number;
}
