import {
    AfterViewChecked,
    Component,
    computed,
    effect,
    ElementRef,
    input,
    model,
    OnInit,
    output,
    signal,
    untracked,
    ViewChild
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { filter, take } from 'rxjs';
import { Budget } from 'src/app/models/budget';
import {
    SaveLineItemPayload,
    SelectedLineItem,
    UpdateLineItemPayload
} from 'src/app/models/lineItem';
import { Transaction } from 'src/app/models/transaction';
import { BudgetService } from 'src/app/services/budget.service';
import { LineItemService } from 'src/app/services/line-item.service';
import { MobileModalService } from 'src/app/services/mobile-modal.service';
import { TransactionService } from 'src/app/services/transaction.service';
import {
    addValueToCurrencyInput,
    checkCurrencyInputKeyValid
} from 'src/app/utils/currencyUtils';

@Component({
    selector: 'BudgetCategoryItem',
    templateUrl: './budget-category-item.component.html',
    styleUrls: ['./budget-category-item.component.scss'],
    standalone: false,
    host: {
        '(touchstart)': 'triggerReorderTimeout()',
        '(touchmove)': 'clearReorderTimeout()',
        '(touchend)': 'clearReorderTimeout()'
    }
})
export class BudgetCategoryItemComponent implements OnInit, AfterViewChecked {
    @ViewChild('lineItemTitleInput') lineItemTitleInput!: ElementRef;
    @ViewChild('plannedAmountInput') plannedAmountInput!: ElementRef;
    @ViewChild(MatMenuTrigger) itemMenu?: MatMenuTrigger;

    readonly itemTitle = input('');
    readonly fund = input(false);
    readonly fundId = input<string | undefined>();
    readonly startingBalance = input<number | undefined>(0);
    readonly transactions = input<Transaction[]>([]);

    itemId = model('');
    plannedAmount = model<number>(0);

    undoCreateNewLineItem = output();
    updateNewLineItemId = output<string>();
    saveNewLineItem = output<SaveLineItemPayload>();
    deleteSavedLineItem = output<string>();

    lineItemInputValue = new FormControl('');
    initialLineItemTitle = '';
    initialPlannedAmount = 0;
    isEditModeEnabled = signal(false);
    isNewLineItem = false;
    previousRemainingAmount: number | null = null;
    reorderTimeout?: ReturnType<typeof setInterval>;
    isReordering = false;

    remainingAmount = computed(() => {
        if (!this.isEditModeEnabled()) {
            const newRemainingAmount = parseFloat(
                this.lineItemService
                    .calculateRemainingAmount(
                        this.transactions(),
                        this.plannedAmount(),
                        this.startingBalance()
                    )
                    .toFixed(2)
            );

            if (this.needsFundBalanceUpdate(newRemainingAmount)) {
                const startingBalanceChange = parseFloat(
                    (
                        newRemainingAmount - this.previousRemainingAmount!
                    ).toFixed(2)
                );

                this.lineItemService.syncFund(
                    this.fundId()!,
                    startingBalanceChange
                );
            }

            this.previousRemainingAmount = newRemainingAmount;
            return newRemainingAmount;
        } else {
            return this.previousRemainingAmount || 0;
        }
    });

    progressPercentage = computed(() => {
        const calculation =
            (this.remainingAmount() / (this.plannedAmount() || 0.01)) * 100;

        return calculation
            ? calculation < 0
                ? 0
                : calculation > 100
                  ? 100
                  : calculation
            : 0;
    });

    isLineItemSelected = computed(
        () =>
            this.itemId() ===
            this.transactionService.currentSelectedLineItem()?.lineItemId
    );

    editConfig = computed(
        () =>
            this.isEditModeEnabled() &&
            (!this.mobileModalService.isMobileDevice() ||
                (this.mobileModalService.isMobileDevice() && !this.itemId()))
    );

    updateTransactionsInfoListener = effect(() => {
        if (
            this.transactions() &&
            this.startingBalance() !== undefined &&
            untracked(
                () =>
                    this.transactionService.currentSelectedLineItem()
                        ?.lineItemId === this.itemId()
            )
        ) {
            untracked(() => this.setTransactionData());
        }
    });

    constructor(
        public transactionService: TransactionService,
        private lineItemService: LineItemService,
        public mobileModalService: MobileModalService,
        private budgetService: BudgetService
    ) {}

    ngOnInit(): void {
        const itemTitle = this.itemTitle();
        this.lineItemInputValue.setValue(itemTitle);

        this.isNewLineItem = itemTitle === 'Add Title' && !this.itemId();

        if (this.isNewLineItem) {
            this.enableEditMode();
        }
    }

    ngAfterViewChecked(): void {
        if (this.isNewLineItem && this.lineItemTitleInput) {
            this.lineItemTitleInput.nativeElement.focus();
            this.lineItemTitleInput.nativeElement.select();
        }
    }

    setSelectedLineItem() {
        if (!this.isLineItemSelected() && !this.isEditModeEnabled()) {
            if (this.mobileModalService.isMobileDevice()) {
                this.setTransactionData();
                this.mobileModalService.isBudgetTransactionsModalOpen.set(true);
            } else {
                this.setTransactionData();
            }
        }
    }

    needsFundBalanceUpdate(newRemainingAmount: number) {
        const currentBudget = untracked(() => this.budgetService.budget());

        return !!(
            this.fund() &&
            this.fundId() &&
            this.previousRemainingAmount !== null &&
            newRemainingAmount !== this.previousRemainingAmount &&
            currentBudget &&
            this.isFutureBudgetAvailable(currentBudget)
        );
    }

    isFutureBudgetAvailable(currentBudget: Budget) {
        const availableBudgets = this.budgetService.availableBudgets();
        if (availableBudgets) {
            return availableBudgets.some(
                (budget) =>
                    budget.year > currentBudget.year ||
                    (budget.year === currentBudget.year &&
                        budget.monthNumber > currentBudget.monthNumber)
            );
        } else {
            return false;
        }
    }

    setTransactionData() {
        const selectedLineItem: SelectedLineItem = {
            name: this.lineItemInputValue.value ?? '',
            plannedAmount: this.plannedAmount(),
            remainingAmount: this.remainingAmount(),
            lineItemId: this.itemId(),
            isFund: this.fund(),
            transactions: this.transactions(),
            startingBalance: this.startingBalance()
        };

        this.transactionService.currentSelectedLineItem.set(selectedLineItem);
    }

    checkIfValidKey(e: KeyboardEvent): boolean {
        return checkCurrencyInputKeyValid(e, this.plannedAmount());
    }

    addValue(e: Event) {
        this.plannedAmount.set(addValueToCurrencyInput(e));
    }

    enableEditMode(targetInput?: HTMLInputElement, e?: MouseEvent) {
        if (e) e.stopPropagation();
        if (this.itemMenu) this.itemMenu.closeMenu();

        targetInput?.focus();
        if (this.mobileModalService.isIOSDevice()) {
            setTimeout(() => targetInput?.select(), 50);
        } else {
            targetInput?.select();
        }

        if (!this.isEditModeEnabled()) {
            this.isEditModeEnabled.set(true);
            this.initialLineItemTitle = this.lineItemInputValue.value ?? '';
            this.initialPlannedAmount = this.plannedAmount();

            if (this.mobileModalService.isMobileDevice()) {
                this.mobileModalService.showPlannedAmounts.set(true);
            }
        }
    }

    cancelEditing(e?: MouseEvent) {
        if (e) e.stopPropagation();

        if (!this.itemId()) {
            this.undoCreateNewLineItem.emit();
        } else {
            this.lineItemInputValue.setValue(this.initialLineItemTitle);
            this.plannedAmount.set(this.initialPlannedAmount);
            this.isEditModeEnabled.set(false);
        }
    }

    createOrUpdateLineItem(
        blurInputs: boolean,
        e?: MouseEvent,
        blur?: FocusEvent
    ) {
        if (e) e.stopPropagation();
        if (blurInputs) this.blurInputs();
        if (
            (blur &&
                this.mobileModalService.isMobileDevice() &&
                this.itemId()) ||
            (!blur &&
                (!this.mobileModalService.isMobileDevice() || !this.itemId()))
        )
            if (this.isNotValidLineItemValues()) {
                this.cancelEditing();
            } else if (!this.itemId()) {
                this.saveLineItem();
            } else {
                this.updateLineItem();
            }
    }

    saveLineItem() {
        const saveLineItemPayload: SaveLineItemPayload = {
            name: this.lineItemInputValue.value ?? '',
            isFund: false,
            plannedAmount: this.plannedAmount(),
            startingBalance: 0
        };

        this.saveNewLineItem.emit(saveLineItemPayload);
        this.updateLineItemPlannedAmountState(saveLineItemPayload);
        this.isEditModeEnabled.set(false);

        this.lineItemService.newlyAddedLineItemId
            .pipe(
                filter((id) => !!id),
                take(1)
            )
            .subscribe((id) => {
                this.updateNewLineItemId.emit(id);
                this.itemId.set(id);

                if (!this.mobileModalService.isMobileDevice()) {
                    this.setTransactionData();
                }
            });
    }

    updateLineItem() {
        const updateLineItemPayload: UpdateLineItemPayload = {
            id: this.itemId(),
            name: this.lineItemInputValue.value ?? '',
            plannedAmount: this.plannedAmount()
        };

        this.lineItemService.updateLineItem(updateLineItemPayload);
        this.updateLineItemPlannedAmountState(updateLineItemPayload);
        this.isEditModeEnabled.set(false);

        if (!this.mobileModalService.isMobileDevice()) {
            this.setTransactionData();
        }
    }

    deleteLineItem() {
        this.transactionService.clearSelectedTransactionData();
        this.deleteSavedLineItem.emit(this.itemId());
    }

    updateLineItemPlannedAmountState(
        payload: UpdateLineItemPayload | SaveLineItemPayload
    ) {
        const fetchedLineItem = this.lineItemService.fetchLineItem(
            this.itemId()
        );
        if (fetchedLineItem) {
            fetchedLineItem.plannedAmount = payload.plannedAmount;
        }
    }

    isNotValidLineItemValues() {
        return (
            (!this.lineItemInputValue.value?.trim() ||
                this.lineItemInputValue.value === this.initialLineItemTitle) &&
            this.plannedAmount() === this.initialPlannedAmount
        );
    }

    checkIfOutsideParent(e: MouseEvent, lineItemContainer: HTMLSpanElement) {
        if (
            !lineItemContainer.contains(e.target as HTMLElement) &&
            !this.isNewLineItem
        ) {
            this.cancelEditing();
        }

        if (this.isNewLineItem) this.isNewLineItem = false;
    }

    triggerReorderTimeout() {
        this.reorderTimeout = setTimeout(() => (this.isReordering = true), 250);
    }

    clearReorderTimeout() {
        if (this.reorderTimeout) {
            clearTimeout(this.reorderTimeout);
        }
        this.isReordering = false;
    }

    blurInputs() {
        if (this.plannedAmountInput && this.lineItemTitleInput) {
            this.plannedAmountInput.nativeElement.blur();
            this.lineItemTitleInput.nativeElement.blur();
        }
    }
}
