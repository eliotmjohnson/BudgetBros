import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { BE_API_URL } from '../constants/constants';
import { Budget } from '../models/budget';
import { AuthService } from './auth.service';
import { TransactionService } from './transaction.service';
import { Subject } from 'rxjs';
import { BBSnagService } from './bb-snag.service';

@Injectable({
    providedIn: 'root'
})
export class BudgetService {
    http = inject(HttpClient);
    transactionService = inject(TransactionService);
    authService = inject(AuthService);
    snagDialogService = inject(BBSnagService);

    baseUrl = `${BE_API_URL}/budgets`;
    budget = signal<Budget | undefined>(undefined);
    isLoading = signal(false);
    getBudgetError = signal<unknown>(null);
    newlyCreatedBudgetId = new Subject<string>();

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
                        this.transactionService.clearSelectedTransactionData();
                    },
                    error: (error) => {
                        this.isLoading.set(false);
                        this.getBudgetError.set(error);
                    }
                });
        }
    }

    addNewBudget(monthNumber: number, year: number) {
        if (this.authService.userId) {
            this.http
                .post<string>(`${this.baseUrl}/${this.authService.userId}`, {
                    monthNumber,
                    year
                })
                .subscribe((budgetId) => {
                    this.setBudgetId(budgetId);
                    this.newlyCreatedBudgetId.next(budgetId);
                });
        }
    }

    deleteBudget(budgetId: string) {
        this.http.delete(`${this.baseUrl}/${budgetId}`).subscribe({
            next: () => {
                this.setBudgetId(undefined);
            },
            error: (error) => {
                this.snagDialogService.openSnagDialog(error);
            }
        });
    }

    clearBudget() {
        this.budget.set(undefined);
        this.transactionService.clearSelectedTransactionData();
    }

    refreshBudget() {
        const currentBudget = this.budget();
        if (currentBudget) {
            this.getBudget(currentBudget.monthNumber, currentBudget.year);
        }
    }

    setBudgetId(budgetId?: string) {
        const currentBudget = this.budget();
        if (currentBudget) {
            currentBudget.budgetId = budgetId ? budgetId : undefined;
        }
    }
}
