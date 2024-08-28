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
import { SaveLineItemPayload } from 'src/app/models/lineItem';
import { Transaction } from 'src/app/models/transaction';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
    selector: 'BudgetCategoryItem',
    templateUrl: './budget-category-item.component.html',
    styleUrls: ['./budget-category-item.component.scss']
})
export class BudgetCategoryItemComponent implements OnInit, AfterViewChecked {
    @ViewChild('lineItemTitleInput') lineItemTitleInput!: ElementRef;
    @Input() itemId = 0;
    @Input() itemTitle = '';
    @Input() startingBalance = 0;
    @Input() plannedAmount = 0;
    @Input() fund = false;
    @Input() transactions?: Transaction[];
    @Output() undoCreateNewLineItem = new EventEmitter();
    @Output() saveNewLineItem = new EventEmitter<SaveLineItemPayload>();

    lineItemInputValue = new FormControl('');
    initialLineItemTitle = '';
    initialPlannedAmount = 0;
    progressPercentage = 30;
    isEditModeEnabled = false;
    isNewLineItem = false;

    constructor(private transactionService: TransactionService) {}

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

        this.isNewLineItem =
            this.itemTitle === 'Add Title' && this.itemId === 0;

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
        this.transactionService.currentSelectedLineItem = this.itemTitle;
        this.transactionService.currentSelectedLineItemId = this.itemId;
        this.transactionService.currentBudgetTransactionData = this.transactions
            ? this.transactions
            : [];
    }

    checkIfValidKey(e: KeyboardEvent): boolean {
        return (
            !!(
                (e.key === 'Backspace' && this.plannedAmount) ||
                e.key.includes('Arrow')
            ) ||
            !(
                isNaN(Number(e.key)) ||
                e.key === ' ' ||
                (e.key === '0' && !this.plannedAmount)
            )
        );
    }

    addValue(e: Event) {
        const reConvertedValue =
            Number((e.target as HTMLInputElement).value.replace(/[^\d]/g, '')) /
            100;

        this.plannedAmount = reConvertedValue !== 0 ? reConvertedValue : 0;
    }

    enableEditMode(targetInput?: HTMLInputElement) {
        if (!this.isEditModeEnabled) this.isEditModeEnabled = true;
        if (targetInput) targetInput.select();
        this.initialLineItemTitle = this.itemTitle;
        this.initialPlannedAmount = this.plannedAmount;
    }

    cancelEditing() {
        if (this.itemId === 0) {
            this.undoCreateNewLineItem.emit();
        } else {
            this.lineItemInputValue.setValue(this.initialLineItemTitle);
            this.plannedAmount = this.initialPlannedAmount;
            this.isEditModeEnabled = false;
        }
    }

    createOrUpdateLineItem() {
        if (this.itemId === 0) {
            const saveLineItemPayload: SaveLineItemPayload = {
                name: this.lineItemInputValue.value ?? '',
                isFund: false,
                plannedAmount: this.plannedAmount,
                startingBalance: 0
            };
            this.saveNewLineItem.emit(saveLineItemPayload);
        }
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
