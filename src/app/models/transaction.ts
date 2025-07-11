import { LineItemReduced } from './lineItem';

export interface Transaction {
    transactionId: string;
    title: string;
    merchant: string | null;
    amount: number;
    notes: string;
    date: string;
    lineItemId?: string | null;
    userId: string;
    deleted: boolean;
    splitTransactionId: string | null;
    isIncomeTransaction: boolean;
}

export type NewTransaction = Omit<
    Transaction,
    'transactionId' | 'lineItemId'
> & { lineItemId?: string | null };

export type IsolatedTransaction = Transaction & {
    budgetCategoryName: string;
};

export interface SplitTransaction {
    transaction: Transaction;
    lineItem: LineItemReduced;
}
