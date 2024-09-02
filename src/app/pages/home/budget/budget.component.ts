import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
    AfterViewChecked,
    Component,
    computed,
    OnInit,
    ViewChild
} from '@angular/core';
import { MatCalendar, MatCalendarView } from '@angular/material/datepicker';
import { MONTHS } from 'src/app/constants/constants';
import { BudgetCategory } from 'src/app/models/budgetCategory';
import { BudgetService } from 'src/app/services/budget.service';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
    selector: 'app-budget',
    templateUrl: './budget.component.html',
    styleUrls: ['./budget.component.scss']
})
export class BudgetComponent implements OnInit, AfterViewChecked {
    @ViewChild('calendarSelector') calendarSelector!: MatCalendar<Date>;

    months = MONTHS;
    selectedMonth = computed(() => {
        return MONTHS[(this.budget()?.monthNumber ?? 1) - 1];
    });
    today = new Date();
    currentDateString = this.today.toLocaleDateString();
    budget = this.budgetService.budget;
    isCalMenuOpened = false;
    isCalendarClosing = false;

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

    ngAfterViewChecked(): void {
        this.setCalendarViewConfig();
    }

    handleDrop(event: CdkDragDrop<BudgetCategory[]>) {
        moveItemInArray(
            this.budget()!.budgetCategories,
            event.previousIndex,
            event.currentIndex
        );
    }

    getNewBudget(calendarSelection: Date | null) {
        if (calendarSelection) {
            const monthSelection = calendarSelection.getMonth() + 1;
            const yearSelection = calendarSelection.getFullYear();
            this.budgetService.getBudget(monthSelection, yearSelection);
            this.closeCalendarSelector(undefined, true);
        }
    }

    closeCalendarSelector(event?: MouseEvent, isCalendarClosing?: boolean) {
        const clickedElementClass = (event?.target as HTMLDivElement)
            ?.className;

        if (
            clickedElementClass?.includes('calendar-selector-overlay') ||
            isCalendarClosing
        ) {
            this.isCalendarClosing = true;
            setTimeout(() => {
                this.isCalMenuOpened = false;
                this.isCalendarClosing = false;
            }, 300);
        }
    }

    createNewBudget() {
        const currentBudget = this.budget();
        if (currentBudget && !currentBudget.budgetId) {
            this.budgetService.addNewBudget(
                currentBudget.monthNumber,
                currentBudget.year
            );
        }

        const newBudgetCategoryPlaceholder: BudgetCategory = {
            budgetCategoryId: '',
            name: 'Category Name',
            lineItems: []
        };
        this.budget()?.budgetCategories.push(newBudgetCategoryPlaceholder);
    }

    openCalendarSelector() {
        this.isCalMenuOpened = true;
    }

    setCalendarViewConfig() {
        if (this.calendarSelector) {
            this.calendarSelector._goToDateInView = (
                _,
                view: MatCalendarView
            ) => {
                if (view !== 'month') {
                    this.calendarSelector.currentView = view;
                }
            };
        }
    }
}
