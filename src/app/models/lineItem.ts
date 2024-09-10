import { Transaction } from './transaction';

export interface LineItem {
    lineItemId: string;
    name: string;
    isFund: boolean;
    plannedAmount: number;
    startingBalance: number;
    transactions: Transaction[];
}

export interface SaveLineItemPayload {
    name: string;
    isFund: boolean;
    plannedAmount: number;
    startingBalance: number;
    budgetCategoryId?: string;
}

export type UpdateLineItemPayload = Omit<
    SaveLineItemPayload,
    'budgetCategoryId'
> & { id: string };

export interface LineItemReduced {
    lineItemId: string;
    lineItemName: string;
}
