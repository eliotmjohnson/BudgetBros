import { Transaction } from './transaction';

export type LineItem = {
    lineItemId: string;
    name: string;
    isFund: boolean;
    plannedAmount: number;
    startingBalance: number;
    transactions: Transaction[];
};

export type SaveLineItemPayload = {
    name: string;
    isFund: boolean;
    plannedAmount: number;
    startingBalance: number;
    budgetCategoryId?: number;
};

export type UpdateLineItemPayload = Omit<
    SaveLineItemPayload,
    'budgetCategoryId'
> & { id: string };

export type LineItemReduced = {
    lineItemId: string;
    lineItemName: string;
};
