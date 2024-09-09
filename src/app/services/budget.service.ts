import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
    budgetError = signal(false);
    newlyCreatedBudgetId = new Subject<string>();

    getBudget(monthNumber: number, year: number) {
        this.budgetError.set(false);
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
                        this.budgetError.set(true);
                        this.clearBudget();
                        this.snagDialogService.openSnagDialog(error);
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
                .subscribe({
                    next: (budgetId) => {
                        this.setBudgetId(budgetId);
                        this.newlyCreatedBudgetId.next(budgetId);
                    },
                    error: (error) => {
                        this.newlyCreatedBudgetId.next('');
                        this.openSnagDialogAndRefresh(error);
                    }
                });
        }
    }

    deleteBudget(budgetId: string) {
        this.http.delete(`${this.baseUrl}/${budgetId}`).subscribe({
            next: () => {
                this.setBudgetId(undefined);
            },
            error: (error) => {
                this.openSnagDialogAndRefresh(error);
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

    openSnagDialogAndRefresh(error: HttpErrorResponse) {
        this.snagDialogService.openSnagDialog(error);
        this.refreshBudget();
    }

    setBudgetId(budgetId?: string) {
        const currentBudget = this.budget();
        if (currentBudget) {
            currentBudget.budgetId = budgetId ? budgetId : undefined;
        }
    }
}
