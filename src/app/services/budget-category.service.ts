import { Injectable, inject, signal } from '@angular/core';
import { BE_API_URL } from '../constants/constants';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { BudgetCategoryWithLineItems } from '../models/budgetCategory';

@Injectable({
  providedIn: 'root'
})
export class BudgetCategoryService {
  http = inject(HttpClient);
  authService = inject(AuthService);

  baseUrl = `${BE_API_URL}/budget-categories`;

  budgetCategoriesWithLineItems = signal<BudgetCategoryWithLineItems[]>([]);

  getBudgetCategoriesWithLineItems(monthNumber: number, year: number) {
    this.http.get<BudgetCategoryWithLineItems[]>(
      `${this.baseUrl}/${this.authService.userId}?month_number=${monthNumber}&year=${year}`
    ).subscribe({
      next: (budgetCategoriesWithLineItems) => {
        this.budgetCategoriesWithLineItems.set(budgetCategoriesWithLineItems);
      }
    })
  }
}
