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
    currentBudgetTransactionData: Transaction[] = [];
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
                    console.log({ transactions });
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
        this.http.post<Transaction>(this.baseUrl, transaction).subscribe({
            next: () => {
                // TODO: handle UI change
            },
            error: (error) => {
                console.error(error);
            }
        });
    }

    updateTransaction(transaction: Transaction) {
        this.http.put<Transaction>(this.baseUrl, transaction).subscribe({
            next: () => {
                // TODO: handle UI change
            },
            error: (error) => {
                console.error(error);
            }
        });
    }

    clearSelectedTransactionData() {
        this.currentSelectedLineItem.set('');
        this.currentSelectedLineItemId.set('');
        this.currentSelectedLineItemBalance.set(0);
        this.currentBudgetTransactionData = [];
    }

    isTransactionDataEmpty() {
        return this.currentBudgetTransactionData.length === 0;
    }
}
