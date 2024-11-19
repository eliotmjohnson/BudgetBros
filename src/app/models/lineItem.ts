import { Transaction } from './transaction';

export interface LineItem {
    lineItemId: string;
    name: string;
    isFund: boolean;
    plannedAmount: number;
    startingBalance: number;
    fundId?: string;
    transactions: Transaction[];
}

export type SelectedLineItem = LineItem & {
    remainingAmount: number;
};

export interface SaveLineItemPayload {
    name: string;
    isFund: boolean;
    plannedAmount: number;
    startingBalance: number;
    budgetCategoryId?: string;
    lineItemOrder?: string[];
}

export type UpdateLineItemPayload = Omit<
    SaveLineItemPayload,
    'budgetCategoryId' | 'startingBalance' | 'isFund'
> & { id: string };

export interface LineItemReduced {
    lineItemId: string;
    lineItemName: string;
}

export interface UpdateFundPayload {
    startingBalance: number;
    isAddingFund: boolean;
}
