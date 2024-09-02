import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BudgetCategoryWithLineItems } from 'src/app/models/budgetCategory';
import { LineItemReduced } from 'src/app/models/lineItem';
import {
    IsolatedTransaction,
    NewTransaction,
    Transaction
} from 'src/app/models/transaction';
import { BudgetCategoryService } from 'src/app/services/budget-category.service';
import { TransactionService } from 'src/app/services/transaction.service';
import {
    addValueToCurrencyInput,
    checkCurrencyInputKeyValid
} from 'src/app/utils/currencyUtils';

export type TransactionModalData = {
    mode: 'add' | 'edit';
    transaction?: IsolatedTransaction;
};

@Component({
    selector: 'app-transaction-modal',
    templateUrl: './transaction-modal.component.html',
    styleUrl: './transaction-modal.component.scss'
})
export class TransactionModalComponent {
    readonly dialogRef = inject(MatDialogRef<TransactionModalComponent>);
    modalData = inject<TransactionModalData>(MAT_DIALOG_DATA);
    transactionService = inject(TransactionService);
    budgetCategoryService = inject(BudgetCategoryService);

    prevSelectedDate = signal<Date | null>(null);

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
                    this.modalData.transaction?.lineItemId
            );

        return lineItem;
    });

    form = new FormGroup({
        amount: new FormControl(this.modalData.transaction?.amount || 0, [
            Validators.required
        ]),
        lineItem: new FormControl<LineItemReduced | null>(
            this.preSelectedLineItem() || null,
            [Validators.required]
        ),
        date: new FormControl<Date | null>(
            this.modalData.transaction?.date
                ? new Date(this.modalData.transaction?.date)
                : null,
            [Validators.required]
        ),
        merchant: new FormControl<string | null>(
            this.modalData.transaction?.merchant || null,
            [Validators.required]
        ),
        notes: new FormControl<string | null>(
            this.modalData.transaction?.notes || null
        )
    });

    constructor() {
        effect(() => {
            if (this.preSelectedLineItem()) {
                this.form.patchValue({
                    lineItem: this.preSelectedLineItem()
                });
            }
        });
    }

    getCategories(e: MatDatepickerInputEvent<Date>) {
        const date = e.value;

        const newMonth = date?.getMonth();
        const newYear = date?.getFullYear();
        const prevMonth = this.prevSelectedDate()?.getMonth();
        const prevYear = this.prevSelectedDate()?.getFullYear();

        const shouldFetchCategories =
            newMonth !== prevMonth || newYear !== prevYear;

        if (date && shouldFetchCategories) {
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
        this.dialogRef.close();
        this.budgetCategoryService.budgetCategoriesWithLineItems.set([]);
    }

    submitForm() {
        if (this.form.invalid) return;

        if (this.modalData.mode === 'add') {
            const submittedTransaction = this.form.value;
            const newTransaction: NewTransaction = {
                title: '',
                amount: submittedTransaction.amount!,
                lineItemId: submittedTransaction.lineItem!.lineItemId,
                date: submittedTransaction.date!.toISOString(),
                merchant: submittedTransaction.merchant!,
                notes: submittedTransaction.notes || '',
                deleted: false
            };

            this.transactionService.addTransaction(newTransaction);
        } else {
            const submittedTransaction = this.form.value;
            const updatedTransaction: Transaction = {
                id: this.modalData.transaction!.id,
                title: this.modalData.transaction!.title,
                deleted: this.modalData.transaction!.deleted,
                amount: submittedTransaction.amount!,
                lineItemId: submittedTransaction.lineItem!.lineItemId,
                date: submittedTransaction.date!.toISOString(),
                merchant: submittedTransaction.merchant!,
                notes: submittedTransaction.notes || ''
            };

            this.transactionService.updateTransaction(updatedTransaction);
        }
        this.closeModal();
    }
}
