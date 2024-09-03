import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { BE_API_URL } from '../constants/constants';
import { BudgetCategoryWithLineItems } from '../models/budgetCategory';
import { AuthService } from './auth.service';
import { BudgetService } from './budget.service';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class BudgetCategoryService {
    http = inject(HttpClient);
    authService = inject(AuthService);
    budgetService = inject(BudgetService);

    baseUrl = `${BE_API_URL}/budget-categories` as const;

    budgetCategoriesWithLineItems = signal<BudgetCategoryWithLineItems[]>([]);
    isLoadingBudgetCategoriesWithLineItems = signal(false);
    newlyCreatedBudgetCategoryId = new Subject<string>();

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

    saveBudgetCategory(name: string) {
        this.http
            .post<string>(`${this.baseUrl}`, {
                name,
                userId: this.authService.userId,
                budgetId: this.budgetService.budget()?.budgetId
            })
            .subscribe((budgetCategoryId) => {
                this.newlyCreatedBudgetCategoryId.next(budgetCategoryId);
            });
    }
}
