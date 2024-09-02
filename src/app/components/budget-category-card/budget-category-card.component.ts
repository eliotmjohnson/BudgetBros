import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
    AfterViewChecked,
    Component,
    ElementRef,
    Input,
    OnInit,
    ViewChild
} from '@angular/core';
import { filter, take } from 'rxjs';

import { LineItem, SaveLineItemPayload } from 'src/app/models/lineItem';
import { BudgetService } from 'src/app/services/budget.service';
import { LineItemService } from 'src/app/services/line-item.service';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
    selector: 'BudgetCategoryCard',
    templateUrl: './budget-category-card.component.html',
    styleUrls: ['./budget-category-card.component.scss']
})
export class BudgetCategoryCardComponent implements AfterViewChecked, OnInit {
    @ViewChild('titleInput') titleInput!: ElementRef<HTMLInputElement>;
    @Input() budgetCategoryId = '';
    @Input() lineItems: LineItem[] = [];
    @Input() name = '';
    isEditingName = true;
    isAddingLineItem = false;

    constructor(
        private transactionService: TransactionService,
        private lineItemService: LineItemService,
        private budgetService: BudgetService
    ) {}

    ngAfterViewChecked(): void {
        if (this.titleInput && this.isEditingName) {
            this.titleInput.nativeElement.focus();
            this.titleInput.nativeElement.select();
        }
    }

    ngOnInit(): void {
        if (this.budgetCategoryId) {
            this.isEditingName = false;
        }
    }

    changeTitle(e?: SubmitEvent) {
        if (e) e.preventDefault();
        this.dropBudgetCategory();
        this.name = this.titleInput.nativeElement.value;
        this.isEditingName = false;
    }

    dropBudgetCategory() {
        const currentBudget = this.budgetService.budget()?.budgetCategories;
        if (currentBudget) {
            const foundIndex = currentBudget.findIndex(
                (category) => !category.budgetCategoryId
            );
            if (foundIndex >= 0) {
                currentBudget.splice(foundIndex, 1);
            }
        }
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
        this.lineItemService.newlyAddedLineItemId
            .pipe(
                filter((id) => !!id),
                take(1)
            )
            .subscribe(() => {
                this.isAddingLineItem = false;
            });
    }

    updateNewLineItemId(lineItemId: string) {
        const lineItemToUpdate = this.lineItems.find(
            (lineItem) => !lineItem.lineItemId
        );

        if (lineItemToUpdate) lineItemToUpdate.lineItemId = lineItemId;
    }

    deleteSavedLineItem(lineItemId: string) {
        const foundIndex = this.lineItems.findIndex(
            (lineItem) => lineItem.lineItemId === lineItemId
        );

        this.lineItems.splice(foundIndex, 1);
    }

    removeNewLineItem() {
        const foundIndex = this.lineItems.findIndex(
            (lineItem) => !lineItem.lineItemId
        );

        this.lineItems.splice(foundIndex, 1);
        this.isAddingLineItem = false;
    }
}
