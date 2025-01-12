import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
    AfterViewChecked,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    signal,
    ViewChild
} from '@angular/core';
import { take } from 'rxjs';
import { deleteItemAnimation } from 'src/app/animations/mobile-item-animations';
import {
    BudgetCategory,
    UpdateBudgetCategoryPayload
} from 'src/app/models/budgetCategory';

import { LineItem, SaveLineItemPayload } from 'src/app/models/lineItem';
import { BudgetCategoryService } from 'src/app/services/budget-category.service';
import { BudgetService } from 'src/app/services/budget.service';
import { LineItemService } from 'src/app/services/line-item.service';
import { MobileModalService } from 'src/app/services/mobile-modal.service';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
    selector: 'BudgetCategoryCard',
    templateUrl: './budget-category-card.component.html',
    styleUrls: ['./budget-category-card.component.scss'],
    animations: [deleteItemAnimation],
    host: {
        '[class.add-animation]': 'isNewBudgetCategory',
        '[class.deleting-category]': 'isDeletingBudgetCategory',
        '[style.min-height]': 'hostHeight',
        '[style.height]': 'hostHeight',
        '[style.translate.rem]':
            'this.mobileModalService.isIOSDevice() && isNewBudgetCategory ? 50 : 0'
    },
    standalone: false
})
export class BudgetCategoryCardComponent implements OnInit, AfterViewChecked {
    @ViewChild('titleInput') titleInput!: ElementRef<HTMLInputElement>;
    @Input() budgetCategoryId = '';
    @Input() lineItems: LineItem[] = [];
    @Input() name = '';
    @Input() order: string[] = [];
    @Output() isAddingBudgetCategory = new EventEmitter<boolean>();
    @Output() hideCategoryButton = new EventEmitter();
    isEditingName = false;
    isAddingLineItem = false;
    isNewBudgetCategory = false;
    isDeletingBudgetCategory = false;
    isSavingBudgetCategory = false;
    isTitleNameHovered = false;
    isDeletingLineItem = signal(false);
    hostHeight = 'auto';

    constructor(
        private transactionService: TransactionService,
        private lineItemService: LineItemService,
        private budgetService: BudgetService,
        private budgetCategoryService: BudgetCategoryService,
        private hostElement: ElementRef<HTMLElement>,
        public mobileModalService: MobileModalService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        if (!this.budgetCategoryId) {
            this.isNewBudgetCategory = true;
            this.enableEditMode();

            if (
                !this.mobileModalService.isIOSDevice() ||
                this.mobileModalService.budgetCopyOption()
            ) {
                setTimeout(() => this.focusTitleInput(), 400);
            } else if (
                this.budgetService.budget()!.budgetCategories.length > 1 &&
                this.mobileModalService.isMobileDevice()
            ) {
                this.centerNewCategory();
            }
        }

        this.sortLineItems();
    }

    ngAfterViewChecked(): void {
        if (this.titleInput && this.isEditingName) {
            if (
                (this.mobileModalService.isIOSDevice() &&
                    !this.mobileModalService.budgetCopyOption()) ||
                !this.isNewBudgetCategory
            ) {
                this.focusTitleInput();
            }
        }
    }

    enableEditMode() {
        if (!this.isEditingName) this.isEditingName = true;
    }

    updateCategoryName(submitEvent?: SubmitEvent): void {
        if (submitEvent) submitEvent.preventDefault();
        const inputValue = this.titleInput.nativeElement.value;

        if (
            (inputValue === 'Category Name' || !inputValue.trim()) &&
            this.isNewBudgetCategory
        ) {
            this.deleteBudgetCategory();
        } else if (this.isNewBudgetCategory && !this.isSavingBudgetCategory) {
            this.saveBudgetCategory(inputValue);
        } else if (inputValue.trim() && inputValue !== this.name) {
            this.updateBudgetCategory(inputValue);
        } else {
            this.titleInput.nativeElement.value = this.name;
        }

        this.isEditingName = false;
        this.titleInput.nativeElement.blur();
        this.isTitleNameHovered = false;
    }

    saveBudgetCategory(inputValue: string) {
        this.isSavingBudgetCategory = true;
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
                this.isSavingBudgetCategory = false;
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

        const lineItemIds = this.lineItems.map((item) => item.lineItemId);
        const isEqual = !this.order.some(
            (lineItemId, i) => lineItemId !== lineItemIds[i]
        );

        if (!isEqual) {
            this.lineItemService.updateLineItemOrder(
                lineItemIds,
                this.budgetCategoryId
            );
        }

        this.order = lineItemIds;
    }

    addNewLineItemPlaceholder(event: MouseEvent) {
        if (!this.isAddingLineItem) {
            const newLineItem: LineItem = {
                lineItemId: '',
                name: 'Add Title',
                isFund: false,
                plannedAmount: 0,
                startingBalance: undefined,
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
        saveLineItemPayload.lineItemOrder = this.order;

        this.lineItemService.saveNewLineItem(saveLineItemPayload);
        this.lineItemService.newlyAddedLineItemId
            .pipe(take(1))
            .subscribe((id) => {
                if (id) {
                    this.isAddingLineItem = false;
                    this.order.push(id);
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
        this.lineItemService.deleteLineItem(
            lineItemId,
            this.order,
            this.budgetCategoryId
        );

        this.isDeletingLineItem.set(true);
        this.cdr.detectChanges();

        const foundIndex = this.lineItems.findIndex(
            (lineItem) => lineItem.lineItemId === lineItemId
        );
        this.lineItems.splice(foundIndex, 1);

        this.order = this.order.filter(
            (lineItemOrderId) => lineItemOrderId !== lineItemId
        );
        this.isDeletingLineItem.set(false);
    }

    removeNewLineItem() {
        this.isDeletingLineItem.set(true);
        this.cdr.detectChanges();
        const foundIndex = this.lineItems.findIndex(
            (lineItem) => !lineItem.lineItemId
        );

        this.lineItems.splice(foundIndex, 1);
        this.isDeletingLineItem.set(false);

        this.isAddingLineItem = false;
    }

    focusTitleInput() {
        this.titleInput.nativeElement.focus();
        this.titleInput.nativeElement.select();
    }

    addRemoveHoverClass(isMouseOut = false) {
        if (isMouseOut && !this.isTitleNameHovered) {
            return;
        } else if (isMouseOut && this.isTitleNameHovered) {
            this.isTitleNameHovered = false;
        } else {
            this.isTitleNameHovered = true;
        }
    }

    centerNewCategory() {
        const categoryLocation =
            this.hostElement.nativeElement.getBoundingClientRect();
        window.scrollTo({
            top: categoryLocation.top - 275,
            behavior: 'smooth'
        });
    }

    sortLineItems() {
        this.lineItems.sort((a, b) => {
            const indexA = this.order.indexOf(a.lineItemId);
            const indexB = this.order.indexOf(b.lineItemId);
            return indexA - indexB;
        });
    }

    setPlannedAmountsWeb(showPlannedAmounts: boolean) {
        this.mobileModalService.showPlannedAmounts.set(showPlannedAmounts);
    }
}
