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
    Renderer2,
    untracked,
    ViewChild
} from '@angular/core';
import { FormControl } from '@angular/forms';
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
    host: {
        '(scroll)': 'setSlideToDelete()',
        '[class.overflow-visible]': 'isEditModeEnabled'
    }
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
    isDeleteMoved = false;
    isDeletingLineItem = false;
    touchlistener: (() => void) | null = null;
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

    constructor(
        private transactionService: TransactionService,
        private lineItemService: LineItemService,
        public mobileModalService: MobileModalService,
        private renderer: Renderer2,
        private host: ElementRef<HTMLElement>
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

        effect(() => {
            if (
                transactionService.currentSelectedLineItem() &&
                untracked(() => mobileModalService.isMobileDevice())
            ) {
                console.log('what');
                this.host.nativeElement.scrollTo({
                    left: 0,
                    behavior: 'smooth'
                });
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

    setSlideToDelete(isSlideEnd = false) {
        const elementWidth = this.host.nativeElement.clientWidth;
        const scrollPosition = this.host.nativeElement.scrollLeft;

        if (isSlideEnd) {
            this.isDeletingLineItem = false;
            this.touchlistener!();
            this.touchlistener = null;

            if (scrollPosition < elementWidth * 0.11 && scrollPosition >= 0) {
                this.host.nativeElement.scrollTo({
                    left: 0,
                    behavior: 'smooth'
                });
            } else if (
                scrollPosition >= elementWidth * 0.11 &&
                scrollPosition < elementWidth * 0.7
            ) {
                this.host.nativeElement.scrollTo({
                    left: elementWidth * 0.23,
                    behavior: 'smooth'
                });
            } else if (scrollPosition >= elementWidth * 0.7) {
                this.host.nativeElement.scrollTo({
                    left: elementWidth,
                    behavior: 'smooth'
                });

                this.isDeletingLineItem = true;
                setTimeout(() => this.deleteLineItem(), 300);
            }
        } else {
            if (!this.touchlistener) {
                this.touchlistener = this.renderer.listen(
                    'document',
                    'touchend',
                    () => this.setSlideToDelete(true)
                );
            }

            if (scrollPosition > elementWidth * 0.7) {
                this.isDeleteMoved = true;
            } else {
                this.isDeleteMoved = false;
            }
        }
    }
}
