import {
    AfterViewChecked,
    Component,
    computed,
    effect,
    ElementRef,
    EventEmitter,
    input,
    Input,
    model,
    OnInit,
    Output,
    signal,
    untracked,
    ViewChild
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { filter, take } from 'rxjs';
import {
    SaveLineItemPayload,
    SelectedLineItem,
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
    styleUrls: ['./budget-category-item.component.scss'],
    standalone: false
})
export class BudgetCategoryItemComponent implements OnInit, AfterViewChecked {
    @ViewChild('lineItemTitleInput') lineItemTitleInput!: ElementRef;
    @ViewChild('plannedAmountInput') plannedAmountInput!: ElementRef;
    @ViewChild(MatMenuTrigger) itemMenu?: MatMenuTrigger;
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
    isEditModeEnabled = signal(false);
    isNewLineItem = false;
    remainingAmount = computed(() => this.calculateRemainingAmount());
    progressPercentage = computed(() => {
        const calculation =
            (this.remainingAmount() / this.plannedAmount()) * 100;
        return calculation ? (calculation < 0 ? 0 : calculation) : 0;
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

    constructor(
        public transactionService: TransactionService,
        private lineItemService: LineItemService,
        public mobileModalService: MobileModalService
    ) {
        effect(() => {
            if (
                this.transactions() &&
                untracked(
                    () =>
                        transactionService.currentSelectedLineItem()?.lineItemId
                )
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
                  (balance, transaction) =>
                      transaction.isIncomeTransaction
                          ? balance + transaction.amount
                          : balance - transaction.amount,
                  this.startingBalance + this.plannedAmount()
              )
            : this.startingBalance + this.plannedAmount();
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

    setTransactionData() {
        const selectedLineItem: SelectedLineItem = {
            name: this.lineItemInputValue.value ?? '',
            plannedAmount: this.plannedAmount(),
            remainingAmount: this.remainingAmount(),
            lineItemId: this.itemId(),
            isFund: this.fund,
            transactions: this.transactions()
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
            isFund: false,
            plannedAmount: this.plannedAmount(),
            startingBalance: 0
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

    blurInputs() {
        if (this.plannedAmountInput && this.lineItemTitleInput) {
            this.plannedAmountInput.nativeElement.blur();
            this.lineItemTitleInput.nativeElement.blur();
        }
    }
}
