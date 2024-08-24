import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, computed, OnInit } from '@angular/core';
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
    selectedMonth = computed(() => {
        return MONTHS[(this.budget()?.monthNumber ?? 1) - 1];
    });
    today = new Date();
    currentDateString = this.today.toLocaleDateString();
    budget = this.budgetService.budget;
    isCalMenuOpened = false;

    constructor(
        public transactionService: TransactionService,
        public budgetService: BudgetService
    ) {}

    ngOnInit(): void {
        if (!this.budgetService.budget()) {
            this.budgetService.getBudget(
                this.today.getMonth() + 1,
                this.today.getFullYear()
            );
        }
    }

    handleDrop(event: CdkDragDrop<BudgetCategory[]>) {
        moveItemInArray(
            this.budget()?.budgetCategories!,
            event.previousIndex,
            event.currentIndex
        );
    }

    getNewBudget(calendarSelection: Date | null) {
        if (calendarSelection) {
            const monthSelection = calendarSelection.getMonth() + 1;
            const yearSelection = calendarSelection.getFullYear();
            this.budgetService.getBudget(monthSelection, yearSelection);
            this.isCalMenuOpened = false;
        }
    }

    closeCalendarSelector(event: MouseEvent) {
        if (
            (event.target as HTMLDivElement).className.includes(
                'calendar-selector-overlay'
            )
        ) {
            this.isCalMenuOpened = false;
        }
    }

    openCalendarSelector() {
        this.isCalMenuOpened = true;
    }
}
