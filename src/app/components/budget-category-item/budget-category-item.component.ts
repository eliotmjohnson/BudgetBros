import {
    AfterViewChecked,
    Component,
    computed,
    effect,
    untracked,
    ElementRef,
    EventEmitter,
    input,
    Input,
    model,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { filter, take } from 'rxjs';
import {
    SaveLineItemPayload,
    UpdateLineItemPayload
} from 'src/app/models/lineItem';
import { Transaction } from 'src/app/models/transaction';
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
    styleUrls: ['./budget-category-item.component.scss']
})
export class BudgetCategoryItemComponent implements OnInit, AfterViewChecked {
    @ViewChild('lineItemTitleInput') lineItemTitleInput!: ElementRef;
    @ViewChild('plannedAmountInput') plannedAmountInput!: ElementRef;
    @Input() itemTitle = '';
    @Input() startingBalance = 0;
    @Input() fund = false;
    @Output() undoCreateNewLineItem = new EventEmitter();
    @Output() updateNewLineItemId = new EventEmitter<string>();
    @Output() saveNewLineItem = new EventEmitter<SaveLineItemPayload>();
    @Output() deleteSavedLineItem = new EventEmitter<string>();

    itemId = model('');
    transactions = input<Transaction[]>([]);
    plannedAmount = model<number>(0);
    lineItemInputValue = new FormControl('');
    initialLineItemTitle = '';
    initialPlannedAmount = 0;
    isEditModeEnabled = false;
    isNewLineItem = false;
    remainingAmount = computed(() => this.calculateRemainingAmount());
    progressPercentage = computed(
        () => (this.remainingAmount() / this.plannedAmount()) * 100 || 0
    );
    isLineItemSelected = computed(
        () =>
            this.itemId() ===
            this.transactionService.currentSelectedLineItemId()
    );

    constructor(
        private transactionService: TransactionService,
        private lineItemService: LineItemService,
        public mobileModalService: MobileModalService
    ) {
        effect(() => {
            if (
                this.transactions() &&
                untracked(() => transactionService.currentSelectedLineItemId())
            ) {
                untracked(() => this.setTransactionData());
            }
        });
    }

    ngOnInit(): void {
        this.lineItemInputValue.setValue(this.itemTitle);

        this.isNewLineItem = this.itemTitle === 'Add Title' && !this.itemId();

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

    calculateRemainingAmount() {
        return this.transactions().length
            ? this.transactions().reduce(
                  (balance, transaction) => balance - transaction.amount,
                  this.startingBalance + this.plannedAmount()
              )
            : this.startingBalance + this.plannedAmount();
    }

    setSelectedLineItem() {
        if (!this.isLineItemSelected()) {
            if (
                this.mobileModalService.isMobileDevice() &&
                !this.isEditModeEnabled
            ) {
                this.setTransactionData();
                this.mobileModalService.isBudgetTransactionsModalOpen.set(true);
            } else if (!this.mobileModalService.isMobileDevice()) {
                this.setTransactionData();
            }
        }
    }

    setTransactionData() {
        this.transactionService.currentSelectedLineItemBalance.set(
            this.remainingAmount()
        );
        this.transactionService.currentSelectedLineItem.set(
            this.lineItemInputValue.value ?? ''
        );
        this.transactionService.currentSelectedLineItemId.set(this.itemId());
        this.transactionService.currentBudgetTransactionData.set(
            this.transactions()
        );
    }

    checkIfValidKey(e: KeyboardEvent): boolean {
        return checkCurrencyInputKeyValid(e, this.plannedAmount());
    }

    addValue(e: Event) {
        this.plannedAmount.set(addValueToCurrencyInput(e));
    }

    enableEditMode(targetInput?: HTMLInputElement) {
        targetInput?.select();
        if (!this.isEditModeEnabled) {
            this.isEditModeEnabled = true;
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
            this.isEditModeEnabled = false;
        }
    }

    createOrUpdateLineItem(blurInputs: boolean, e?: MouseEvent) {
        if (e) e.stopPropagation();
        if (blurInputs) this.blurInputs();

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

        this.lineItemService.newlyAddedLineItemId
            .pipe(
                filter((id) => !!id),
                take(1)
            )
            .subscribe((id) => {
                this.updateNewLineItemId.emit(id);
                this.itemId.set(id);
                this.isEditModeEnabled = false;

                if (!this.mobileModalService.isMobileDevice()) {
                    this.setTransactionData();
                }
            });
    }

    updateLineItem() {
        const updateLineItemPayload: UpdateLineItemPayload = {
            id: this.itemId(),
            name: this.lineItemInputValue.value ?? '',
            isFund: false,
            plannedAmount: this.plannedAmount(),
            startingBalance: 0
        };

        this.lineItemService.updateLineItem(updateLineItemPayload);
        this.isEditModeEnabled = false;

        if (!this.mobileModalService.isMobileDevice()) {
            this.setTransactionData();
        }
    }

    deleteLineItem() {
        this.lineItemService.deleteLineItem(this.itemId());
        this.transactionService.clearSelectedTransactionData();
        this.deleteSavedLineItem.emit(this.itemId());
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

    blurInputs() {
        if (this.plannedAmountInput && this.lineItemTitleInput) {
            this.plannedAmountInput.nativeElement.blur();
            this.lineItemTitleInput.nativeElement.blur();
        }
    }
}
