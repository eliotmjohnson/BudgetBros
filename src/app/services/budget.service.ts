import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { BASE_BE_URL } from '../constants/constants';
import { Budget } from '../models/budget';
import { AuthService } from './auth.service';

const baseUrl = `${BASE_BE_URL}/budgets`;

@Injectable({
    providedIn: 'root'
})
export class BudgetService {
    http = inject(HttpClient);
    authService = inject(AuthService);

    budget = signal<Budget | undefined>(undefined);
    isLoading = signal(false);
    getBudgetError = signal<unknown>(null);

    getBudget(monthNumber: number, year: number) {
        if (this.authService.userId) {
            this.isLoading.set(true);
            this.http
                .get<Budget>(
                    `${baseUrl}/${this.authService.userId}?month_number=${monthNumber}&year=${year}`
                )
                .subscribe({
                    next: (budget) => {
                        this.isLoading.set(false);
                        this.budget.set(budget);
                    },
                    error: (error) => {
                        this.getBudgetError.set(error);
                    }
                });
        }
    }
}
