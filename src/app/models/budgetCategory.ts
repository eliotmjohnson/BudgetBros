import { LineItem, LineItemReduced } from './lineItem';

export interface BudgetCategory {
    budgetCategoryId: string;
    name: string;
    lineItems: LineItem[];
}

export type UpdateBudgetCategoryPayload = Omit<BudgetCategory, 'lineItems'>;

export interface BudgetCategoryWithLineItems {
    budgetCategoryId: number;
    budgetCategoryName: string;
    lineItems: LineItemReduced[];
}
