import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { BE_API_URL } from '../constants/constants';
import { BudgetCategoryWithLineItems } from '../models/budgetCategory';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class BudgetCategoryService {
    http = inject(HttpClient);
    authService = inject(AuthService);

    baseUrl = `${BE_API_URL}/budget-categories` as const;

    budgetCategoriesWithLineItems = signal<BudgetCategoryWithLineItems[]>([]);
    isLoadingBudgetCategoriesWithLineItems = signal(false);

    getBudgetCategoriesWithLineItems(monthNumber: number, year: number) {
        this.isLoadingBudgetCategoriesWithLineItems.set(true);
        this.http
            .get<
                BudgetCategoryWithLineItems[]
            >(`${this.baseUrl}/${this.authService.userId}?month_number=${monthNumber}&year=${year}`)
            .subscribe({
                next: (budgetCategoriesWithLineItems) => {
                    this.budgetCategoriesWithLineItems.set(
                        budgetCategoriesWithLineItems
                    );
                },
                complete: () => {
                    this.isLoadingBudgetCategoriesWithLineItems.set(false);
                }
            });
    }
}
