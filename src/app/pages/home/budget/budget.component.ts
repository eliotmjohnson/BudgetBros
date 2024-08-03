import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, inject } from '@angular/core';
import { MONTHS } from 'src/app/constants/constants';
import { BudgetCategory } from 'src/app/models/budget';
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
    budget = this.budgetService.getBudget(7, 2024);
    isCalMenuOpened = false;

    constructor(
        public transactionService: TransactionService,
        public budgetService: BudgetService
    ) {}

    ngOnInit(): void {
        if (!this.budgetService.isBudgetLoaded()) {
            this.budgetService.getBudget();
        }
    }

    handleDrop(event: CdkDragDrop<BudgetCategory[]>) {
        moveItemInArray(
            this.budget()?.budgetCategories!,
            event.previousIndex,
            event.currentIndex
        );
    }
}
