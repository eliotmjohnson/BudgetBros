import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Signal, inject, signal } from '@angular/core';
import { MONTHS } from 'src/app/constants/constants';
import { budgetCategoryData } from 'src/app/mocks/budgetCategoryData';
import { Budget, BudgetCategory } from 'src/app/models/budget';
import { BudgetService } from 'src/app/services/budget.service';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
    selector: 'app-budget',
    templateUrl: './budget.component.html',
    styleUrls: ['./budget.component.scss']
})
export class BudgetComponent {
    budgetService = inject(BudgetService);

    months = MONTHS;
    selectedMonth = 'January';
    currentDate = new Date().toLocaleDateString();
    budgetCategories: BudgetCategory[] = budgetCategoryData;
    isCalMenuOpened = false;

    budget: Signal<Budget | undefined> = signal(undefined);


    constructor(public transactionService: TransactionService) {
        this.budget = this.budgetService.getBudget(7, 2024);
    }

    handleDrop(event: CdkDragDrop<BudgetCategory[]>) {
        moveItemInArray(
            this.budgetCategories,
            event.previousIndex,
            event.currentIndex
        );
    }
}
