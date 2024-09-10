import { LineItem, LineItemReduced } from './lineItem';

export interface BudgetCategory {
    budgetCategoryId: string;
    name: string;
    lineItems: LineItem[];
}

export interface BudgetCategoryWithLineItems {
    budgetCategoryId: number;
    budgetCategoryName: string;
    lineItems: LineItemReduced[];
}
