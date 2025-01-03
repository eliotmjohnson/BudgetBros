import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { BE_API_URL } from '../constants/constants';
import {
    AvailableBudget,
    Budget,
    UpdateBudgetIncomePayload
} from '../models/budget';
import { AuthService } from './auth.service';
import { BBSnagService } from './bb-snag.service';
import { TransactionService } from './transaction.service';
import { isEqual } from 'lodash';

@Injectable({
    providedIn: 'root'
})
export class BudgetService {
    http = inject(HttpClient);
    transactionService = inject(TransactionService);
    authService = inject(AuthService);
    snagDialogService = inject(BBSnagService);

    baseUrl = `${BE_API_URL}/budgets`;
    budget = signal<Budget | undefined>(undefined, { equal: isEqual });
    availableBudgets = signal<AvailableBudget[] | undefined>(undefined);
    isLoading = signal(false);
    isCopyingBudget = signal(false);
    budgetError = signal(false);
    newlyCreatedBudgetId = new Subject<string>();

    getBudget(monthNumber: number, year: number) {
        this.budgetError.set(false);
        if (this.authService.userId && !this.isLoading()) {
            this.isLoading.set(true);
            this.getAvailableBudgets(monthNumber, year);

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

    getAvailableBudgets(monthNumber: number, year: number) {
        if (this.authService.userId) {
            this.http
                .get<
                    AvailableBudget[]
                >(`${this.baseUrl}/available/${this.authService.userId}?month_number=${monthNumber}&year=${year}`)
                .subscribe({
                    next: (res) => {
                        this.availableBudgets.set(res);
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

    updateBudgetIncome(payload: UpdateBudgetIncomePayload) {
        this.http
            .patch(`${this.baseUrl}/${this.budget()?.budgetId}`, payload)
            .subscribe({
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
            currentBudget.additionalIncomeAmount = 0;
            currentBudget.paycheckAmount = 0;
        }
    }

    copyBudget(monthNumber: number, year: number) {
        this.isCopyingBudget.set(true);
        if (this.authService.userId) {
            this.http
                .post(`${this.baseUrl}/copy/${this.authService.userId}`, {
                    currentMonthNumber: monthNumber,
                    currentYear: year
                })
                .subscribe({
                    next: () => {
                        this.isCopyingBudget.set(false);
                        this.refreshBudget();
                    }
                });
        }
    }
}
