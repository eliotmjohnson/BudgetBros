import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BudgetCategoryWithLineItems } from 'src/app/models/budgetCategory';
import { LineItemReduced } from 'src/app/models/lineItem';
import { BudgetCategoryService } from 'src/app/services/budget-category.service';
import { TransactionService } from 'src/app/services/transaction.service';
import {
    addValueToCurrencyInput,
    checkCurrencyInputKeyValid
} from 'src/app/utils/currencyUtils';

export type TransactionModalData = {
    mode: 'add' | 'edit';
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

    form = new FormGroup({
        amount: new FormControl(0, [Validators.required]),
        lineItem: new FormControl<LineItemReduced | null>(null, [
            Validators.required
        ]),
        date: new FormControl<Date | null>(null, [Validators.required]),
        merchant: new FormControl<string | null>(null, [Validators.required])
    });

    dropdownCategories = computed<BudgetCategoryWithLineItems[]>(() =>
        this.budgetCategoryService.budgetCategoriesWithLineItems()
    );

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
    }

    submitForm() {
        console.log(this.form);
        if (this.form.invalid) return;

        console.log(this.form.value);
    }
}
