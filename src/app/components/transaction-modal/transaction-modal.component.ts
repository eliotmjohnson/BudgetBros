import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    computed,
    effect,
    ElementRef,
    inject,
    OnInit,
    signal,
    ViewChild
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs';
import { BudgetCategoryWithLineItems } from 'src/app/models/budgetCategory';
import { LineItemReduced } from 'src/app/models/lineItem';
import {
    IsolatedTransaction,
    NewTransaction,
    Transaction
} from 'src/app/models/transaction';
import { BudgetCategoryService } from 'src/app/services/budget-category.service';
import { LineItemService } from 'src/app/services/line-item.service';
import { MobileModalService } from 'src/app/services/mobile-modal.service';
import { TransactionService } from 'src/app/services/transaction.service';
import {
    addValueToCurrencyInput,
    checkCurrencyInputKeyValid
} from 'src/app/utils/currencyUtils';

export interface TransactionModalData {
    mode:
        | 'add'
        | 'edit'
        | 'budgetTransactionsAdd'
        | 'budgetTransactionsAddMobile'
        | 'budgetTransactionsEdit';
    transaction?: IsolatedTransaction;
    lineItemId?: string;
}

@Component({
    selector: 'app-transaction-modal',
    templateUrl: './transaction-modal.component.html',
    styleUrl: './transaction-modal.component.scss',
    standalone: false
})
export class TransactionModalComponent implements AfterViewInit, OnInit {
    @ViewChild('titleInput') titleInput!: ElementRef;
    readonly dialogRef = inject(MatDialogRef<TransactionModalComponent>, {
        optional: true
    });
    modalData = inject<TransactionModalData>(MAT_DIALOG_DATA, {
        optional: true
    });
    transactionService = inject(TransactionService);
    budgetCategoryService = inject(BudgetCategoryService);
    lineItemService = inject(LineItemService);
    changeDetector = inject(ChangeDetectorRef);
    mobileService = inject(MobileModalService);

    today = new Date();
    prevSelectedDate = signal<Date | null>(null);
    mobileModalData = this.mobileService.mobileModalData;
    isMobileModalFocused = !this.mobileService.isMobileDevice();
    isBudgetTransactionsModal =
        (this.modalData || this.mobileModalData).mode ===
            'budgetTransactionsAdd' ||
        (this.modalData || this.mobileModalData).mode ===
            'budgetTransactionsEdit';

    dropdownCategories = computed<BudgetCategoryWithLineItems[]>(() =>
        this.budgetCategoryService.budgetCategoriesWithLineItems()
    );

    preSelectedLineItem = computed<LineItemReduced | undefined>(() => {
        const budgetCategories =
            this.budgetCategoryService.budgetCategoriesWithLineItems();

        const lineItem = budgetCategories
            .flatMap((category) => category.lineItems)
            .find(
                (lineItem) =>
                    lineItem.lineItemId ===
                    (this.modalData || this.mobileModalData).transaction
                        ?.lineItemId
            );

        return lineItem;
    });

    form = new FormGroup(
        {
            title: new FormControl<string | null>(
                (this.modalData || this.mobileModalData).transaction?.title ||
                    null,
                [Validators.required]
            ),
            amount: new FormControl<number | undefined>(undefined),
            lineItem: new FormControl<LineItemReduced | null | string>(
                {
                    value:
                        this.preSelectedLineItem() ||
                        (this.modalData || this.mobileModalData).lineItemId ||
                        null,
                    disabled: !this.dropdownCategories().length
                },
                [Validators.required]
            ),
            date: new FormControl<Date | null>(
                (this.modalData || this.mobileModalData).transaction?.date
                    ? new Date(
                          (
                              this.modalData || this.mobileModalData
                          ).transaction!.date
                      )
                    : new Date(),
                [Validators.required]
            ),
            merchant: new FormControl<string | null>(
                (this.modalData || this.mobileModalData).transaction
                    ?.merchant || null
            ),
            notes: new FormControl<string | null>(
                (this.modalData || this.mobileModalData).transaction?.notes ||
                    null
            ),
            isIncomeTransaction: new FormControl<boolean>(
                (this.modalData || this.mobileModalData).transaction
                    ?.isIncomeTransaction || false
            )
        },
        {}
    );

    constructor() {
        effect(() => {
            if (this.preSelectedLineItem()) {
                this.form.patchValue({
                    lineItem: this.preSelectedLineItem()
                });
            }
        });

        effect(() => {
            if (
                this.dropdownCategories().length ||
                this.isBudgetTransactionsModal
            ) {
                this.form.get('lineItem')?.enable();
                this.form.updateValueAndValidity({ onlySelf: true });
            }
        });
    }
    ngOnInit(): void {
        if (
            (this.modalData || this.mobileModalData).mode === 'add' ||
            (this.modalData || this.mobileModalData).mode ===
                'budgetTransactionsAddMobile'
        ) {
            this.budgetCategoryService.getBudgetCategoriesWithLineItems(
                this.today.getMonth() + 1,
                this.today.getFullYear()
            );
        }
    }

    ngAfterViewInit(): void {
        if (this.mobileService.isMobileDevice()) {
            const valueLength = this.titleInput.nativeElement.value.length;
            this.titleInput.nativeElement.focus();
            this.titleInput.nativeElement.setSelectionRange(
                valueLength,
                valueLength
            );
            setTimeout(() => (this.isMobileModalFocused = true), 400);
        }
        this.form.controls.amount.setValue(
            (this.modalData || this.mobileModalData).transaction?.amount || 0
        );
        this.form.controls.amount.setValidators(Validators.min(0.01));
        this.form.controls.amount.updateValueAndValidity();
        this.changeDetector.detectChanges();
    }

    getCategories(e: MatDatepickerInputEvent<Date>) {
        const date = e.value;

        const newMonth = date?.getMonth();
        const newYear = date?.getFullYear();
        const prevMonth = this.prevSelectedDate()?.getMonth();
        const prevYear = this.prevSelectedDate()?.getFullYear();

        const shouldFetchCategories =
            newMonth !== prevMonth || newYear !== prevYear;

        if (date && shouldFetchCategories && !this.isBudgetTransactionsModal) {
            this.budgetCategoryService.getBudgetCategoriesWithLineItems(
                date.getMonth() + 1,
                date.getFullYear()
            );

            this.prevSelectedDate.set(date);
        }
    }

    checkIfValidKey(e: KeyboardEvent): boolean {
        return checkCurrencyInputKeyValid(e, this.form.value.amount as number);
    }

    addValue(e: Event) {
        addValueToCurrencyInput(e, this.form);
    }

    closeModal() {
        if (this.dialogRef) {
            this.dialogRef.close();
        } else {
            this.mobileService.isAddTransactionModalOpen.set(false);
        }

        this.budgetCategoryService.budgetCategoriesWithLineItems.set([]);
    }

    submitForm() {
        if (this.form.invalid) return;
        const needsRefresh =
            (this.modalData || this.mobileModalData).mode !==
                'budgetTransactionsAddMobile' &&
            !this.isBudgetTransactionsModal;

        if (
            (this.modalData || this.mobileModalData).mode !== 'edit' &&
            (this.modalData || this.mobileModalData).mode !==
                'budgetTransactionsEdit'
        ) {
            const submittedTransaction = this.form.value;
            const newTransaction: NewTransaction = {
                userId: '',
                title: submittedTransaction.title || '',
                amount: submittedTransaction.amount!,
                lineItemId:
                    (submittedTransaction.lineItem! as LineItemReduced)
                        .lineItemId ||
                    (this.modalData || this.mobileModalData).lineItemId!,
                date: submittedTransaction.date!.toISOString(),
                merchant: submittedTransaction.merchant
                    ? submittedTransaction.merchant
                    : null,
                notes: submittedTransaction.notes || '',
                deleted: false,
                isIncomeTransaction:
                    submittedTransaction.isIncomeTransaction || false
            };

            if (!needsRefresh) {
                this.eagerAddTransaction(newTransaction);
                this.updateEagerTransactionId(newTransaction);
            }

            this.transactionService.addTransaction(
                newTransaction,
                needsRefresh
            );
        } else {
            const submittedTransaction = this.form.value;
            const updatedTransaction: Transaction = {
                transactionId: (this.modalData || this.mobileModalData)
                    .transaction!.transactionId,
                title: submittedTransaction.title || '',
                deleted: (this.modalData || this.mobileModalData).transaction!
                    .deleted,
                amount: submittedTransaction.amount!,
                lineItemId:
                    (submittedTransaction.lineItem! as LineItemReduced)
                        .lineItemId ||
                    (this.modalData || this.mobileModalData).lineItemId!,
                date: submittedTransaction.date!.toISOString(),
                merchant: submittedTransaction.merchant
                    ? submittedTransaction.merchant
                    : null,
                notes: submittedTransaction.notes || '',
                isIncomeTransaction:
                    submittedTransaction.isIncomeTransaction || false
            };

            if (!needsRefresh) {
                this.eagerUpdateTransaction(updatedTransaction);
            }
            this.transactionService.updateTransaction(
                updatedTransaction,
                (this.modalData || this.mobileModalData).transaction
                    ?.budgetCategoryName,
                needsRefresh
            );
        }
        this.closeModal();
    }

    setIsIncomeSelectedValue(isIncomeTransaction: boolean) {
        this.form.patchValue({ isIncomeTransaction: isIncomeTransaction });
        if (!this.form.dirty) {
            this.form.markAsDirty();
        }
    }

    eagerAddTransaction(transaction: NewTransaction) {
        const foundLineItem = this.lineItemService.fetchLineItem(
            transaction.lineItemId
        );

        if (foundLineItem) {
            foundLineItem.transactions = [
                ...foundLineItem.transactions,
                { ...transaction, transactionId: '' }
            ];
        }
    }

    updateEagerTransactionId(newTransaction: NewTransaction) {
        this.transactionService.newlyCreatedTransactionId
            .pipe(take(1))
            .subscribe((id) => {
                const newEagerTransaction = this.lineItemService
                    .fetchLineItem(newTransaction.lineItemId)
                    ?.transactions.find((trx) => !trx.transactionId);

                if (newEagerTransaction) {
                    newEagerTransaction.transactionId = id;
                }
            });
    }

    eagerUpdateTransaction(transaction: Transaction) {
        const foundLineItem = this.lineItemService.fetchLineItem(
            transaction.lineItemId
        );

        if (foundLineItem) {
            foundLineItem.transactions = foundLineItem.transactions.map((t) =>
                t.transactionId === transaction.transactionId
                    ? {
                          ...transaction
                      }
                    : t
            );
        }
    }
}
