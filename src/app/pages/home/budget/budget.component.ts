import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
    AfterViewChecked,
    ChangeDetectorRef,
    Component,
    computed,
    effect,
    ElementRef,
    OnInit,
    signal,
    untracked,
    ViewChild
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatCalendar, MatCalendarView } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { skip, take } from 'rxjs';
import { BudgetStarterComponent } from 'src/app/components/budget-starter/budget-starter.component';
import { MONTHS } from 'src/app/constants/constants';
import { BudgetCategory } from 'src/app/models/budgetCategory';
import { BudgetCategoryService } from 'src/app/services/budget-category.service';
import { BudgetService } from 'src/app/services/budget.service';
import { MobileModalService } from 'src/app/services/mobile-modal.service';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
    selector: 'app-budget',
    templateUrl: './budget.component.html',
    styleUrls: ['./budget.component.scss'],
    standalone: false
})
export class BudgetComponent implements OnInit, AfterViewChecked {
    @ViewChild('calendarSelector') calendarSelector!: MatCalendar<Date>;
    @ViewChild('phantomInput') phantomInput!: ElementRef<HTMLInputElement>;
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
    isOpeningKeyboard = signal(false);
    isCopyingBudget = toObservable(this.budgetService.isCopyingBudget).pipe(
        skip(1),
        take(2)
    );

    selectedDate = computed(() => {
        const currentBudget = this.budget();

        if (currentBudget) {
            return new Date(currentBudget.year, currentBudget.monthNumber - 1);
        } else {
            return this.today;
        }
    });

    constructor(
        public transactionService: TransactionService,
        public budgetService: BudgetService,
        public mobileModalService: MobileModalService,
        private budgetCategoryService: BudgetCategoryService,
        private dialogService: MatDialog,
        private cdr: ChangeDetectorRef
    ) {
        effect(() => {
            if (this.budget()?.budgetCategories) {
                this.sortBudgetCategories();
            }
        });

        effect(() => this.handleBudgetCopyMobile());
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
                this.isScrolling = false;
                this.refreshBudget();
            }
        }
    }

    setIsScrolling() {
        if (this.scrollPosition <= 10) {
            this.isScrolling = true;
        }
    }

    openBudgetStarterModal() {
        if (!this.mobileModalService.isMobileDevice()) {
            const dialogRef = this.dialogService.open(BudgetStarterComponent, {
                height: '40rem',
                width: '35rem'
            });

            dialogRef.componentInstance.optionEmitter.subscribe((option) => {
                if (option === 'copy') {
                    this.copyCurrentBudget();
                    this.isCopyingBudget.subscribe((isCopyingBudget) => {
                        if (!isCopyingBudget) {
                            dialogRef.close();
                        }
                    });
                } else if (option === 'new') {
                    this.createNewBudgetCategoryPlaceholder();
                    dialogRef.close();
                }
            });
        } else {
            this.mobileModalService.isMobileBudgetStarterModalOpen.set(true);
        }
    }

    handleBudgetCopyMobile() {
        if (this.mobileModalService.isMobileDevice()) {
            const budgetCopyOptionMobile =
                this.mobileModalService.budgetCopyOption();
            if (budgetCopyOptionMobile === 'copy') {
                untracked(() => this.copyCurrentBudget());
                this.isCopyingBudget.subscribe((isCopyingBudget) => {
                    if (!isCopyingBudget) {
                        this.mobileModalService.isMobileBudgetStarterModalOpen.set(
                            false
                        );
                        this.mobileModalService.budgetCopyOption.set('');
                    }
                });
            } else if (budgetCopyOptionMobile === 'new') {
                this.openKeyboard();

                untracked(() =>
                    setTimeout(() => {
                        this.createNewBudgetCategoryPlaceholder();
                        this.isOpeningKeyboard.set(false);
                        this.mobileModalService.budgetCopyOption.set('');
                    }, 350)
                );
                this.mobileModalService.isMobileBudgetStarterModalOpen.set(
                    false
                );
            }
        }
    }

    openKeyboard() {
        this.isOpeningKeyboard.set(true);
        this.cdr.detectChanges();
        this.phantomInput.nativeElement.focus();
    }

    copyCurrentBudget() {
        const currentBudget = this.budget();

        if (currentBudget) {
            this.budgetService.copyBudget(
                currentBudget.monthNumber,
                currentBudget.year
            );
        }
    }
}
