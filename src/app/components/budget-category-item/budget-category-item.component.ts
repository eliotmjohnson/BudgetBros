import {
    AfterViewChecked,
    Component,
    ElementRef,
    EventEmitter,
    Input,
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
    @Input() itemId = '';
    @Input() itemTitle = '';
    @Input() startingBalance = 0;
    @Input() plannedAmount = 0;
    @Input() fund = false;
    @Input() transactions?: Transaction[];
    @Output() undoCreateNewLineItem = new EventEmitter();
    @Output() updateNewLineItemId = new EventEmitter<string>();
    @Output() saveNewLineItem = new EventEmitter<SaveLineItemPayload>();
    @Output() deleteSavedLineItem = new EventEmitter<string>();

    lineItemInputValue = new FormControl('');
    initialLineItemTitle = '';
    initialPlannedAmount = 0;
    progressPercentage = 30;
    isEditModeEnabled = false;
    isNewLineItem = false;

    constructor(
        private transactionService: TransactionService,
        private lineItemService: LineItemService
    ) {}

    get remainingAmount() {
        return this.startingBalance + this.plannedAmount;
    }

    get isLineItemSelected() {
        return (
            this.itemId === this.transactionService.currentSelectedLineItemId
        );
    }

    ngOnInit(): void {
        this.lineItemInputValue.setValue(this.itemTitle);

        this.isNewLineItem = this.itemTitle === 'Add Title' && !this.itemId;

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

    setTransactionData() {
        this.transactionService.currentSelectedLineItemBalance =
            this.remainingAmount;
        this.transactionService.currentSelectedLineItem =
            this.lineItemInputValue.value ?? '';
        this.transactionService.currentSelectedLineItemId = this.itemId;
        this.transactionService.currentBudgetTransactionData = this.transactions
            ? this.transactions
            : [];
    }

    checkIfValidKey(e: KeyboardEvent): boolean {
        return checkCurrencyInputKeyValid(e, this.plannedAmount);
    }

    addValue(e: Event) {
        this.plannedAmount = addValueToCurrencyInput(e);
    }

    enableEditMode(targetInput?: HTMLInputElement) {
        if (targetInput) targetInput.select();
        if (!this.isEditModeEnabled) {
            this.isEditModeEnabled = true;
            this.initialLineItemTitle = this.lineItemInputValue.value ?? '';
            this.initialPlannedAmount = this.plannedAmount;
        }
    }

    cancelEditing() {
        if (!this.itemId) {
            this.undoCreateNewLineItem.emit();
        } else {
            this.lineItemInputValue.setValue(this.initialLineItemTitle);
            this.plannedAmount = this.initialPlannedAmount;
            this.isEditModeEnabled = false;
        }
    }

    createOrUpdateLineItem() {
        if (!this.itemId) {
            const saveLineItemPayload: SaveLineItemPayload = {
                name: this.lineItemInputValue.value ?? '',
                isFund: false,
                plannedAmount: this.plannedAmount,
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
                    this.itemId = id;
                    this.isEditModeEnabled = false;
                    this.setTransactionData();
                });
        } else {
            const updateLineItemPayload: UpdateLineItemPayload = {
                id: this.itemId,
                name: this.lineItemInputValue.value ?? '',
                isFund: false,
                plannedAmount: this.plannedAmount,
                startingBalance: 0
            };

            this.lineItemService.updateLineItem(updateLineItemPayload);
            this.isEditModeEnabled = false;
        }
    }

    deleteLineItem() {
        this.lineItemService.deleteLineItem(this.itemId);
        this.deleteSavedLineItem.emit(this.itemId);
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
}
