import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
    AfterViewChecked,
    Component,
    computed,
    effect,
    OnInit,
    ViewChild
} from '@angular/core';
import { MatCalendar, MatCalendarView } from '@angular/material/datepicker';
import { MONTHS } from 'src/app/constants/constants';
import { BudgetCategory } from 'src/app/models/budgetCategory';
import { BudgetCategoryService } from 'src/app/services/budget-category.service';
import { BudgetService } from 'src/app/services/budget.service';
import { MobileModalService } from 'src/app/services/mobile-modal.service';
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
    isAddingBudgetCategory = false;
    isAddCategoryButtonHidden = false;
    isRefreshing = false;
    isBudgetBrosBudget = true;
    isReordering = false;
    scrollPosition = 0;
    isScrolling = false;

    constructor(
        public transactionService: TransactionService,
        public budgetService: BudgetService,
        public mobileModalService: MobileModalService,
        private budgetCategoryService: BudgetCategoryService
    ) {
        effect(() => {
            if (this.budget()?.budgetCategories) {
                this.sortBudgetCategories();
            }
        });
    }

    ngOnInit(): void {
        if (!this.budget()?.budgetId) {
            this.budgetService.getBudget(
                this.today.getMonth() + 1,
                this.today.getFullYear()
            );
        } else {
            this.budgetService.refreshBudget();
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

        this.mobileModalService.isReorderingCategories.set(false);
        this.isReordering = false;
        this.budgetCategoryService.updateBudgetCategoryOrder();
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

    createNewBudgetCategoryPlaceholder(elem?: HTMLDivElement) {
        if (elem) {
            elem.scrollTo({
                top: elem.scrollHeight,
                behavior: 'smooth'
            });
        }

        const newBudgetCategoryPlaceholder: BudgetCategory = {
            budgetCategoryId: '',
            name: 'Category Name',
            lineItemOrder: [],
            lineItems: []
        };

        this.budget()?.budgetCategories.push(newBudgetCategoryPlaceholder);
        this.transactionService.clearSelectedTransactionData();
        this.isAddingBudgetCategory = true;
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

    enableAddingBudgetCategory(e: boolean) {
        this.isAddingBudgetCategory = e;
        if (this.isAddCategoryButtonHidden) {
            this.isAddCategoryButtonHidden = false;
        }
    }

    refreshBudget() {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.budgetService.refreshBudget();
            setTimeout(() => (this.isRefreshing = false), 1000);
        }
    }

    sortBudgetCategories() {
        const currentBudget = this.budget();

        if (currentBudget) {
            const budgetCategoryOrder = currentBudget.categoryOrder;

            currentBudget.budgetCategories =
                currentBudget.budgetCategories.sort((a, b) => {
                    const indexA = budgetCategoryOrder.indexOf(
                        a.budgetCategoryId
                    );
                    const indexB = budgetCategoryOrder.indexOf(
                        b.budgetCategoryId
                    );
                    return indexA - indexB;
                });
        }
    }

    setBudgetPanelExpansion(isBudgetBrosBudget: boolean) {
        this.isBudgetBrosBudget = isBudgetBrosBudget;
    }

    startRefresh(event: Event) {
        if (this.mobileModalService.isMobileDevice()) {
            this.scrollPosition = (event.target as HTMLDivElement).scrollTop;

            if (this.scrollPosition > 10) {
                this.isScrolling = false;
            } else if (this.scrollPosition <= -110 && this.isScrolling) {
                this.refreshBudget();
            }
        }
    }

    setIsScrolling() {
        if (this.scrollPosition <= 10) {
            this.isScrolling = true;
        }
    }
}
