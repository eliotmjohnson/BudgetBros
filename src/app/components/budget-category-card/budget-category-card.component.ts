import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
    AfterViewChecked,
    Component,
    ElementRef,
    Input,
    ViewChild
} from '@angular/core';

import { LineItem, SaveLineItemPayload } from 'src/app/models/lineItem';
import { LineItemService } from 'src/app/services/line-item.service';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
    selector: 'BudgetCategoryCard',
    templateUrl: './budget-category-card.component.html',
    styleUrls: ['./budget-category-card.component.scss']
})
export class BudgetCategoryCardComponent implements AfterViewChecked {
    @ViewChild('titleInput') titleInput!: ElementRef<HTMLInputElement>;
    @Input() budgetCategoryId = 0;
    @Input() lineItems: LineItem[] = [];
    @Input() name = '';
    isEditingName = false;
    isAddingLineItem = false;

    constructor(
        private transactionService: TransactionService,
        private lineItemService: LineItemService
    ) {}

    ngAfterViewChecked(): void {
        if (this.titleInput && this.isEditingName) {
            this.titleInput.nativeElement.focus();
            this.titleInput.nativeElement.select();
        }
    }

    changeTitle(e: SubmitEvent) {
        e.preventDefault();
        this.name = this.titleInput.nativeElement.value;
        this.isEditingName = false;
    }

    handleDrop(event: CdkDragDrop<LineItem[]>) {
        moveItemInArray(
            this.lineItems,
            event.previousIndex,
            event.currentIndex
        );
    }

    addNewLineItemPlaceholder(event: MouseEvent) {
        if (!this.isAddingLineItem) {
            const newLineItem: LineItem = {
                lineItemId: '',
                name: 'Add Title',
                isFund: false,
                plannedAmount: 0,
                startingBalance: 0,
                transactions: []
            };

            this.lineItems.push(newLineItem);
            this.transactionService.clearTransactionData();
            this.isAddingLineItem = true;
        } else {
            event.stopPropagation();
        }
    }

    saveNewLineItem(saveLineItemPayload: SaveLineItemPayload) {
        saveLineItemPayload.budgetCategoryId = this.budgetCategoryId;

        this.lineItemService.saveNewLineItem(saveLineItemPayload);
        this.isAddingLineItem = false;
    }

    removeNewLineItem() {
        const foundIndex = this.lineItems.findIndex(
            (lineItem) => !lineItem.lineItemId
        );

        this.lineItems.splice(foundIndex, 1);
        this.isAddingLineItem = false;
    }
}
