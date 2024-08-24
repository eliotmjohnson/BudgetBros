import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { BE_API_URL } from '../constants/constants';
import { Budget } from '../models/budget';
import { AuthService } from './auth.service';
import { TransactionService } from './transaction.service';

@Injectable({
    providedIn: 'root'
})
export class BudgetService {
    http = inject(HttpClient);
    transactionService = inject(TransactionService);
    authService = inject(AuthService);

    baseUrl = `${BE_API_URL}/budgets`;
    budget = signal<Budget | undefined>(undefined);
    isLoading = signal(false);
    getBudgetError = signal<unknown>(null);

    getBudget(monthNumber: number, year: number) {
        if (this.authService.userId) {
            this.isLoading.set(true);
            this.http
                .get<Budget>(
                    `${this.baseUrl}/${this.authService.userId}?month_number=${monthNumber}&year=${year}`
                )
                .subscribe({
                    next: (budget) => {
                        this.isLoading.set(false);
                        this.budget.set(budget);
                        if (!this.transactionService.isTransactionDataEmpty()) {
                            this.transactionService.clearTransactionData();
                        }
                    },
                    error: (error) => {
                        this.isLoading.set(false);
                        this.getBudgetError.set(error);
                    }
                });
        }
    }

    clearBudget() {
        this.budget.set(undefined);
        this.transactionService.clearTransactionData();
    }
}
