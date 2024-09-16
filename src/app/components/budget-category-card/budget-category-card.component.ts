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
import { take } from 'rxjs';
import {
    BudgetCategory,
    UpdateBudgetCategoryPayload
} from 'src/app/models/budgetCategory';

import { LineItem, SaveLineItemPayload } from 'src/app/models/lineItem';
import { BudgetCategoryService } from 'src/app/services/budget-category.service';
import { BudgetService } from 'src/app/services/budget.service';
import { LineItemService } from 'src/app/services/line-item.service';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
    selector: 'BudgetCategoryCard',
    templateUrl: './budget-category-card.component.html',
    styleUrls: ['./budget-category-card.component.scss'],
    host: {
        '[class.add-animation]': 'isNewBudgetCategory',
        '[class.deleting-category]': 'isDeletingBudgetCategory',
        '[style.min-height]': 'hostHeight',
        '[style.height]': 'hostHeight'
    }
})
export class BudgetCategoryCardComponent implements AfterViewChecked, OnInit {
    @ViewChild('titleInput') titleInput!: ElementRef<HTMLInputElement>;
    @Input() budgetCategoryId = '';
    @Input() lineItems: LineItem[] = [];
    @Input() name = '';
    @Output() isAddingBudgetCategory = new EventEmitter<boolean>();
    @Output() hideCategoryButton = new EventEmitter();
    isEditingName = false;
    isAddingLineItem = false;
    isNewBudgetCategory = false;
    isDeletingBudgetCategory = false;
    hostHeight = 'auto';

    constructor(
        private transactionService: TransactionService,
        private lineItemService: LineItemService,
        private budgetService: BudgetService,
        private budgetCategoryService: BudgetCategoryService,
        private hostElement: ElementRef<HTMLElement>
    ) {}

    ngAfterViewChecked(): void {
        if (this.titleInput && this.isEditingName) {
            this.titleInput.nativeElement.focus();
            this.titleInput.nativeElement.select();
        }
    }

    ngOnInit(): void {
        if (!this.budgetCategoryId) {
            this.isNewBudgetCategory = true;
            // Timout for animation completion
            setTimeout(() => {
                this.isEditingName = true;
            }, 400);
        }
    }

    enableEditMode() {
        this.isEditingName = true;
    }

    updateCategoryName(submitEvent?: SubmitEvent): void {
        if (submitEvent) submitEvent.preventDefault();
        const inputValue = this.titleInput.nativeElement.value;

        if (
            (inputValue === 'Category Name' || !inputValue.trim()) &&
            this.isNewBudgetCategory
        ) {
            this.deleteBudgetCategory();
        } else if (this.isNewBudgetCategory) {
            this.saveBudgetCategory(inputValue);
        } else if (inputValue.trim() && inputValue !== this.name) {
            this.updateBudgetCategory(inputValue);
        }

        this.isEditingName = false;
    }

    saveBudgetCategory(inputValue: string) {
        this.name = inputValue;
        this.budgetCategoryService.saveBudgetCategory(inputValue);
        this.budgetCategoryService.newlyCreatedBudgetCategoryId
            .pipe(take(1))
            .subscribe((id) => {
                if (id) {
                    this.updateBudgetCategoryId(id);
                } else {
                    this.dropBudgetCategory(false);
                }
                this.isNewBudgetCategory = false;
                this.isAddingBudgetCategory.emit(false);
            });
    }

    updateBudgetCategory(inputValue: string) {
        this.name = inputValue;
        const budgetCategoryUpdatePayload: UpdateBudgetCategoryPayload = {
            budgetCategoryId: this.budgetCategoryId,
            name: inputValue
        };

        this.budgetCategoryService.updateBudgetCategory(
            budgetCategoryUpdatePayload
        );
    }

    deleteBudgetCategory() {
        this.isNewBudgetCategory = false;
        if (this.budgetCategoryId) {
            this.budgetCategoryService.deleteBudgetCategory(
                this.budgetCategoryId
            );
        }

        this.dropBudgetCategory();
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

    dropBudgetCategory(needsAnimation = true) {
        this.transactionService.clearSelectedTransactionData();

        const currentBudgetCategories =
            this.budgetService.budget()?.budgetCategories;
        if (currentBudgetCategories) {
            const foundIndex = currentBudgetCategories.findIndex(
                (category) =>
                    category.budgetCategoryId === this.budgetCategoryId
            );

            if (needsAnimation) {
                this.handleCategoryDeleteAnimation(currentBudgetCategories);

                setTimeout(() => {
                    currentBudgetCategories.splice(foundIndex, 1);
                    this.isDeletingBudgetCategory = false;
                    this.isAddingBudgetCategory.emit(false);
                }, 400);
            } else {
                currentBudgetCategories.splice(foundIndex, 1);
            }
        }
    }

    handleCategoryDeleteAnimation(currentBudgetCategories: BudgetCategory[]) {
        if (currentBudgetCategories.length === 1) {
            this.hideCategoryButton.emit();
        }

        this.hostHeight = this.hostElement.nativeElement.scrollHeight + 'px';
        this.isDeletingBudgetCategory = true;
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
            .pipe(take(1))
            .subscribe((id) => {
                if (id) {
                    this.isAddingLineItem = false;
                }
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
