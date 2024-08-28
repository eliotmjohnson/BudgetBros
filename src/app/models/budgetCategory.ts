import { LineItemReduced } from "./lineItem";

export type BudgetCategoryWithLineItems = {
    budgetCategoryId: number;
    budgetCategoryName: string;
    lineItems: LineItemReduced[];
}