import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { BE_API_URL } from '../constants/constants';
import {
    BudgetCategoryWithLineItems,
    UpdateBudgetCategoryPayload
} from '../models/budgetCategory';
import { AuthService } from './auth.service';
import { BudgetService } from './budget.service';
import { Subject, take } from 'rxjs';
import { TransactionService } from './transaction.service';
import { BBSnagService } from './bb-snag.service';

@Injectable({
    providedIn: 'root'
})
export class BudgetCategoryService {
    http = inject(HttpClient);
    authService = inject(AuthService);
    budgetService = inject(BudgetService);
    transactionService = inject(TransactionService);
    snagDialogService = inject(BBSnagService);

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
        const currentBudget = this.budgetService.budget();

        if (currentBudget) {
            if (!currentBudget.budgetId) {
                this.budgetService.addNewBudget(
                    currentBudget.monthNumber,
                    currentBudget.year
                );

                this.budgetService.newlyCreatedBudgetId
                    .pipe(take(1))
                    .subscribe((budgetId) => {
                        if (budgetId) {
                            this.executeBudgetCategorySave(
                                budgetId,
                                name,
                                currentBudget.categoryOrder
                            );
                        }
                    });
            } else {
                this.executeBudgetCategorySave(
                    currentBudget.budgetId,
                    name,
                    currentBudget.categoryOrder
                );
            }
        }
    }

    private executeBudgetCategorySave(
        budgetId: string,
        name: string,
        categoryOrder: string[]
    ) {
        this.http
            .post<string>(`${this.baseUrl}`, {
                name,
                userId: this.authService.userId,
                budgetId: budgetId,
                categoryOrder: categoryOrder
            })
            .subscribe({
                next: (budgetCategoryId) => {
                    this.newlyCreatedBudgetCategoryId.next(budgetCategoryId);
                    categoryOrder.push(budgetCategoryId);
                },
                error: (error) => {
                    this.newlyCreatedBudgetCategoryId.next('');
                    this.budgetService.openSnagDialogAndRefresh(error);
                }
            });
    }

    deleteBudgetCategory(budgetCategoryId: string) {
        const currentBudget = this.budgetService.budget();
        const shouldDeleteBudget = currentBudget?.budgetCategories.length === 1;

        if (currentBudget) {
            this.http
                .delete(`${this.baseUrl}/${budgetCategoryId}`, {
                    body: {
                        categoryOrder: currentBudget.categoryOrder,
                        budgetId: currentBudget.budgetId
                    }
                })
                .subscribe({
                    next: () => {
                        if (currentBudget.budgetId && shouldDeleteBudget) {
                            this.budgetService.deleteBudget(
                                currentBudget.budgetId
                            );
                        }
                    },
                    error: (error) => {
                        this.budgetService.openSnagDialogAndRefresh(error);
                    }
                });

            currentBudget.categoryOrder = currentBudget.categoryOrder.filter(
                (categoryId) => categoryId !== budgetCategoryId
            );
        }
    }

    updateBudgetCategory(
        updateBudgetCategoryPayload: UpdateBudgetCategoryPayload
    ) {
        this.http
            .patch(`${this.baseUrl}`, updateBudgetCategoryPayload)
            .subscribe({
                error: (error) => {
                    this.budgetService.openSnagDialogAndRefresh(error);
                }
            });
    }

    updateBudgetCategoryOrder() {
        const currentBudget = this.budgetService.budget();
        if (currentBudget) {
            const budgetCategoryIds = currentBudget.budgetCategories.map(
                (category) => category.budgetCategoryId
            );
            const isEqual = !currentBudget.categoryOrder.some(
                (categoryId, i) => categoryId !== budgetCategoryIds[i]
            );

            if (!isEqual) {
                this.http
                    .post(
                        `${this.baseUrl}/reorder/${currentBudget.budgetId}`,
                        budgetCategoryIds
                    )
                    .subscribe();

                currentBudget.categoryOrder = budgetCategoryIds;
            }
        }
    }
}
