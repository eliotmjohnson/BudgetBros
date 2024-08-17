import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { MONTHS } from 'src/app/constants/constants';
import { BudgetCategory } from 'src/app/models/budget';
import { BudgetService } from 'src/app/services/budget.service';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
    selector: 'app-budget',
    templateUrl: './budget.component.html',
    styleUrls: ['./budget.component.scss']
})
export class BudgetComponent implements OnInit {
    months = MONTHS;
    selectedMonth = 'January';
    currentDate = new Date().toLocaleDateString();
    budget = this.budgetService.budget;
    isCalMenuOpened = false;

    constructor(
        public transactionService: TransactionService,
        public budgetService: BudgetService
    ) {}

    ngOnInit(): void {
        this.budgetService.getBudget(7, 2024);
    }

    handleDrop(event: CdkDragDrop<BudgetCategory[]>) {
        moveItemInArray(
            this.budget()?.budgetCategories!,
            event.previousIndex,
            event.currentIndex
        );
    }
}
