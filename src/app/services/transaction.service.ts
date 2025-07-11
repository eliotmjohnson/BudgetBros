import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { BE_API_URL } from '../constants/constants';
import { SelectedLineItem } from '../models/lineItem';
import {
    IsolatedTransaction,
    NewTransaction,
    Transaction
} from '../models/transaction';
import { AuthService } from './auth.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { of, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TransactionService {
    baseUrl = `${BE_API_URL}/transactions`;

    http = inject(HttpClient);
    authService = inject(AuthService);

    currentSelectedLineItem = signal<SelectedLineItem | null>(null);
    newlyCreatedTransactions = new Subject<IsolatedTransaction[]>();

    selectedStartDate = signal<Date | null>(null);
    selectedEndDate = signal<Date | null>(null);

    transactions = rxResource({
        request: () => ({
            start: this.selectedStartDate(),
            end: this.selectedEndDate()
        }),
        loader: ({ request: { start, end } }) => {
            if (start && end) {
                return this.getTransactionsBetweenDates(start, end);
            }

            return of([]);
        }
    });

    untrackedTransactions = rxResource({
        loader: () => this.getUntrackedTransactions()
    });

    deletedTransactions = rxResource({
        loader: () => this.getDeletedTransactions()
    });

    getTransactionsBetweenDates(date1: Date, date2: Date) {
        return this.http.get<IsolatedTransaction[]>(
            `
                ${this.baseUrl}/${this.authService.userId}?start_date=${date1.toISOString()}&end_date=${date2.toISOString()}
            `
        );
    }

    getUntrackedTransactions() {
        return this.http.get<Transaction[]>(
            `${this.baseUrl}/untracked/${this.authService.userId}`
        );
    }

    getDeletedTransactions() {
        return this.http.get<IsolatedTransaction[]>(
            `${this.baseUrl}/deleted/${this.authService.userId}`
        );
    }

    softDeleteTransaction(transactionId: IsolatedTransaction['transactionId']) {
        const currentTransactions = this.transactions.value();

        this.transactions.update((transactions) =>
            transactions?.filter((t) => t.transactionId !== transactionId)
        );

        this.http
            .delete(`${this.baseUrl}/soft-delete/${transactionId}`)
            .subscribe({
                next: () => {
                    this.deletedTransactions.reload();
                },
                error: (error) => {
                    console.error(error);
                    this.transactions.set(currentTransactions);
                }
            });
    }

    recoverTransaction(transactionId: IsolatedTransaction['transactionId']) {
        return this.http
            .put<void>(`${this.baseUrl}/recover/${transactionId}`, null)
            .subscribe({
                next: () => {
                    this.deletedTransactions.update((transactions) =>
                        transactions?.filter(
                            (t) => t.transactionId !== transactionId
                        )
                    );
                },
                error: (error) => {
                    console.error(error);
                }
            });
    }

    addTransactions(transactions: NewTransaction[], needsRefresh = true) {
        transactions.forEach((trx) => (trx.userId = this.authService.userId!));

        this.http
            .post<IsolatedTransaction[]>(this.baseUrl, transactions)
            .subscribe({
                next: (transactions) => {
                    if (needsRefresh) {
                        this.selectedStartDate.set(
                            new Date(transactions[0].date)
                        );
                        this.selectedEndDate.set(
                            new Date(transactions[0].date)
                        );
                    } else {
                        this.newlyCreatedTransactions.next(transactions);
                    }
                },
                error: (error) => {
                    console.error(error);
                }
            });
    }

    updateTransactions(
        transactions: Transaction[],
        budgetCategoryName?: string,
        needsRefresh = true
    ) {
        this.http
            .put<IsolatedTransaction[]>(this.baseUrl, transactions)
            .subscribe({
                next: (newCreatedTrxs) => {
                    if (needsRefresh) {
                        const prevTransaction = this.transactions
                            .value()
                            ?.find(
                                (t) =>
                                    t.transactionId ===
                                    transactions[0].transactionId
                            );
                        if (
                            !prevTransaction ||
                            new Date(transactions[0].date).getMonth() !==
                                new Date(prevTransaction!.date).getMonth()
                        ) {
                            this.getTransactionsBetweenDates(
                                new Date(transactions[0].date),
                                new Date(transactions[0].date)
                            );
                        } else {
                            this.transactions.update((trxs) =>
                                trxs?.map((t) => {
                                    const foundTrx = transactions.find(
                                        (updatedTrx) =>
                                            t.transactionId ===
                                            updatedTrx.transactionId
                                    );

                                    return foundTrx
                                        ? {
                                              ...foundTrx,
                                              budgetCategoryName:
                                                  budgetCategoryName!
                                          }
                                        : t;
                                })
                            );
                        }
                    } else {
                        this.newlyCreatedTransactions.next(newCreatedTrxs);
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
