import { LineItem, LineItemReduced } from './lineItem';

export type BudgetCategory = {
    budgetCategoryId: string;
    name: string;
    lineItems: LineItem[];
};

export type SaveBudgetCategoryPayload = {
    budgetCategoryId: number;
    name: string;
    lineItems: LineItem[];
};

export type BudgetCategoryWithLineItems = {
    budgetCategoryId: number;
    budgetCategoryName: string;
    lineItems: LineItemReduced[];
};
