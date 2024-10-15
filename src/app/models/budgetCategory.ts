import { LineItem, LineItemReduced } from './lineItem';

export interface BudgetCategory {
    budgetCategoryId: string;
    name: string;
    lineItemOrder: string[];
    lineItems: LineItem[];
}

export type UpdateBudgetCategoryPayload = Omit<
    BudgetCategory,
    'lineItems' | 'lineItemOrder'
>;

export interface BudgetCategoryWithLineItems {
    budgetCategoryId: number;
    budgetCategoryName: string;
    lineItems: LineItemReduced[];
}
