import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BE_API_URL } from '../constants/constants';
import { AuthService } from './auth.service';
import {
    IsolatedTransaction,
    NewTransaction,
    Transaction
} from '../models/transaction';

@Injectable({
    providedIn: 'root'
})
export class TransactionService {
    http = inject(HttpClient);
    authService = inject(AuthService);

    baseUrl = `${BE_API_URL}/transactions`;
    currentSelectedLineItem = signal('');
    currentSelectedLineItemId = signal('');
    currentSelectedLineItemBalance = signal(0);
    currentBudgetTransactionData = signal<Transaction[]>([]);
    transactions = signal<IsolatedTransaction[]>([]);
    isLoading = signal(false);

    getTransactionsBetweenDates(date1: Date, date2: Date) {
        this.isLoading.set(true);
        this.http
            .get<IsolatedTransaction[]>(
                `
                ${this.baseUrl}/${this.authService.userId}?start_date=${date1.toISOString()}&end_date=${date2.toISOString()}
            `
            )
            .subscribe({
                next: (transactions) => {
                    this.isLoading.set(false);
                    this.transactions.set(transactions);
                },
                error: (error) => {
                    this.isLoading.set(false);
                    console.error(error);
                }
            });
    }

    softDeleteTransaction(transactionId: IsolatedTransaction['id']) {
        const currentTransactions = this.transactions();

        this.transactions.update((transactions) =>
            transactions.filter((t) => t.id !== transactionId)
        );

        this.http.delete(`${this.baseUrl}/soft/${transactionId}`).subscribe({
            error: (error) => {
                console.error(error);
                this.transactions.set(currentTransactions);
            }
        });
    }

    addTransaction(transaction: NewTransaction) {
        this.http
            .post<IsolatedTransaction>(this.baseUrl, transaction)
            .subscribe({
                next: (transaction) => {
                    this.getTransactionsBetweenDates(
                        new Date(transaction.date),
                        new Date(transaction.date)
                    );
                },
                error: (error) => {
                    console.error(error);
                }
            });
    }

    updateTransaction(transaction: Transaction, budgetCategoryName?: string) {
        this.http.put<string>(this.baseUrl, transaction).subscribe({
            next: () => {
                const prevTransaction = this.transactions().find(
                    (t) => t.id === transaction.id
                );

                if (
                    !prevTransaction ||
                    new Date(transaction.date).getMonth() !==
                        new Date(prevTransaction!.date).getMonth()
                ) {
                    this.getTransactionsBetweenDates(
                        new Date(transaction.date),
                        new Date(transaction.date)
                    );
                } else {
                    this.transactions.update((transactions) =>
                        transactions.map((t) =>
                            t.id === transaction.id
                                ? {
                                      ...transaction,
                                      budgetCategoryName: budgetCategoryName!
                                  }
                                : t
                        )
                    );
                }
            },
            error: (error) => {
                console.error(error);
            }
        });
    }

    clearSelectedTransactionData() {
        if (!this.isTransactionDataEmpty || this.currentSelectedLineItem()) {
            this.currentSelectedLineItem.set('');
            this.currentSelectedLineItemId.set('');
            this.currentSelectedLineItemBalance.set(0);
            this.currentBudgetTransactionData.set([]);
        }
    }

    isTransactionDataEmpty() {
        return this.currentBudgetTransactionData().length === 0;
    }
}
