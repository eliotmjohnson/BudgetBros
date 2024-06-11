import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { MONTHS } from 'src/app/constants/constants';
import { budgetCategoryData } from 'src/app/mocks/budgetCategoryData';
import { BudgetCategory } from 'src/app/models/budget';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
    selector: 'app-budget',
    templateUrl: './budget.component.html',
    styleUrls: ['./budget.component.scss']
})
export class BudgetComponent {
    months = MONTHS;
    selectedMonth = 'January';
    currentDate = new Date().toLocaleDateString();
    budgetCategories: BudgetCategory[] = budgetCategoryData;
    isCalMenuOpened = false;

    constructor(public transactionService: TransactionService) {}

    handleDrop(event: CdkDragDrop<BudgetCategory[]>) {
        moveItemInArray(
            this.budgetCategories,
            event.previousIndex,
            event.currentIndex
        );
    }
}
