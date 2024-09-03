import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
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
import { filter, take } from 'rxjs';

import { LineItem, SaveLineItemPayload } from 'src/app/models/lineItem';
import { BudgetCategoryService } from 'src/app/services/budget-category.service';
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
    @Output() isAddingBudgetCategory = new EventEmitter<boolean>();
    isEditingName = false;
    isAddingLineItem = false;
    isNewBudgetCategory = false;

    constructor(
        private transactionService: TransactionService,
        private lineItemService: LineItemService,
        private budgetService: BudgetService,
        private budgetCategoryService: BudgetCategoryService
    ) {}

    ngAfterViewChecked(): void {
        if (this.titleInput && this.isEditingName) {
            this.titleInput.nativeElement.focus();
            this.titleInput.nativeElement.select();
        }
    }

    ngOnInit(): void {
        if (!this.budgetCategoryId) {
            this.isEditingName = true;
            this.isNewBudgetCategory = true;
        }
    }

    enableEditMode() {
        this.isEditingName = true;
    }

    changeTitle(submitEvent?: SubmitEvent): void {
        if (submitEvent) submitEvent.preventDefault();
        const inputValue = this.titleInput.nativeElement.value;

        if (inputValue === 'Category Name' && this.isNewBudgetCategory) {
            this.deleteBudgetCategory();
        } else {
            this.name = inputValue;
            if (this.isNewBudgetCategory) {
                this.budgetCategoryService.saveBudgetCategory(inputValue);
                this.budgetCategoryService.newlyCreatedBudgetCategoryId
                    .pipe(take(1))
                    .subscribe((id) => {
                        if (this.isNewBudgetCategory) {
                            this.updateBudgetCategoryId(id);
                            this.isNewBudgetCategory = false;
                        }
                    });
            } else {
                // Need to add update logic next!
                console.log('Updating');
            }
        }

        this.isEditingName = false;
        this.isAddingBudgetCategory.emit(false);
    }

    deleteBudgetCategory() {
        const currentBudget = this.budgetService.budget();

        if (currentBudget) {
            const foundIndex = currentBudget.budgetCategories.findIndex(
                (category) =>
                    category.budgetCategoryId === this.budgetCategoryId
            );

            currentBudget.budgetCategories.splice(foundIndex, 1);
        }

        if (this.budgetCategoryId) {
            this.budgetCategoryService.deleteBudgetCategory(
                this.budgetCategoryId
            );
        }
    }

    updateBudgetCategoryId(id: string) {
        const currentBudget = this.budgetService.budget();
        if (currentBudget) {
            const newCategory = currentBudget.budgetCategories.find(
                (category) => !category.budgetCategoryId
            );

            if (newCategory) newCategory.budgetCategoryId = id;
        }
    }

    dropBudgetCategory() {
        const currentBudgetCategories =
            this.budgetService.budget()?.budgetCategories;
        if (currentBudgetCategories) {
            const foundIndex = currentBudgetCategories.findIndex(
                (category) => !category.budgetCategoryId
            );
            if (foundIndex >= 0) {
                currentBudgetCategories.splice(foundIndex, 1);
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
            this.transactionService.clearSelectedTransactionData();
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
