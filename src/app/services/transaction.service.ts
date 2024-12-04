import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { BE_API_URL } from '../constants/constants';
import { SelectedLineItem } from '../models/lineItem';
import {
    IsolatedTransaction,
    NewTransaction,
    Transaction
} from '../models/transaction';
import { AuthService } from './auth.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { getTodayMidnight } from '../utils/timeUtils';

@Injectable({
    providedIn: 'root'
})
export class TransactionService {
    http = inject(HttpClient);
    authService = inject(AuthService);
    baseUrl = `${BE_API_URL}/transactions`;

    currentSelectedLineItem = signal<SelectedLineItem | null>(null);
    newlyCreatedTransactionId = new Subject<string>();

    transactionsDate1 = signal<Date>(getTodayMidnight());
    transactionsDate2 = signal<Date>(getTodayMidnight());

    transactions = rxResource({
        request: () => ({
            date1: this.transactionsDate1(),
            date2: this.transactionsDate2()
        }),
        loader: ({ request: { date1, date2 } }) =>
            this.getTransactionsBetweenDates(date1, date2)
    });

    getTransactionsBetweenDates(date1: Date, date2: Date) {
        return this.http.get<IsolatedTransaction[]>(
            `
                ${this.baseUrl}/${this.authService.userId}?start_date=${date1.toISOString()}&end_date=${date2.toISOString()}
            `
        );
    }

    softDeleteTransaction(transactionId: IsolatedTransaction['transactionId']) {
        const currentTransactions = this.transactions.value();

        this.transactions.update((transactions) =>
            transactions?.filter((t) => t.transactionId !== transactionId)
        );

        this.http.delete(`${this.baseUrl}/soft/${transactionId}`).subscribe({
            error: (error) => {
                console.error(error);
                this.transactions.set(currentTransactions);
            }
        });
    }

    addTransaction(transaction: NewTransaction, needsRefresh = true) {
        transaction.userId = this.authService.userId!;

        this.http
            .post<IsolatedTransaction>(this.baseUrl, transaction)
            .subscribe({
                next: (transaction) => {
                    if (needsRefresh) {
                        this.getTransactionsBetweenDates(
                            new Date(transaction.date),
                            new Date(transaction.date)
                        );
                    } else {
                        this.newlyCreatedTransactionId.next(
                            transaction.transactionId
                        );
                    }
                },
                error: (error) => {
                    console.error(error);
                }
            });
    }

    updateTransaction(
        transaction: Transaction,
        budgetCategoryName?: string,
        needsRefresh = true
    ) {
        this.http.put<string>(this.baseUrl, transaction).subscribe({
            next: () => {
                if (needsRefresh) {
                    const prevTransaction = this.transactions
                        .value()
                        ?.find(
                            (t) => t.transactionId === transaction.transactionId
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
                            transactions?.map((t) =>
                                t.transactionId === transaction.transactionId
                                    ? {
                                          ...transaction,
                                          budgetCategoryName:
                                              budgetCategoryName!
                                      }
                                    : t
                            )
                        );
                    }
                }
            },
            error: (error) => {
                console.error(error);
            }
        });
    }

    clearSelectedTransactionData() {
        if (!this.isTransactionDataEmpty || this.currentSelectedLineItem()) {
            this.currentSelectedLineItem.set(null);
        }
    }

    isTransactionDataEmpty() {
        return this.currentSelectedLineItem()?.transactions.length === 0;
    }
}
