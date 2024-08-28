import { Transaction } from './transaction';

export type LineItem = {
    lineItemId: number;
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
