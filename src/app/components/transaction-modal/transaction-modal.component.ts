import { Component, OnInit, computed, inject} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BudgetCategoryWithLineItems } from 'src/app/models/budgetCategory';
import { BudgetCategoryService } from 'src/app/services/budget-category.service';
import { TransactionService } from 'src/app/services/transaction.service';

export type TransactionModalData = {
  mode: 'add' | 'edit'
}

@Component({
  selector: 'app-transaction-modal',
  templateUrl: './transaction-modal.component.html',
  styleUrl: './transaction-modal.component.scss'
})
export class TransactionModalComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<TransactionModalComponent>);
  modalData = inject<TransactionModalData>(MAT_DIALOG_DATA);
  transactionService = inject(TransactionService);
  budgetCategoryService = inject(BudgetCategoryService);

  form = new FormGroup({
    amount: new FormControl(0, [Validators.required]),
    category: new FormControl<number | null>(null, [Validators.required]),
    date: new FormControl<Date | null>(null, [Validators.required]),
    merchant: new FormControl<string>('', [Validators.required])
  })

  dropdownCategories = computed<BudgetCategoryWithLineItems[]>(() => this.budgetCategoryService.budgetCategoriesWithLineItems())

  ngOnInit(): void {
    this.form.valueChanges.subscribe(value => {
      if (value.date) {
        this.budgetCategoryService.getBudgetCategoriesWithLineItems(
          value.date.getMonth() + 1, 
          value.date.getFullYear()
        )
      }
    }) 
  }

  getCategories(e: MatDatepickerInputEvent<Date>) {
    const date = e.value;

    if (date && date.getDate() !== this.form.value.date?.getDate()) {
      this.budgetCategoryService.getBudgetCategoriesWithLineItems(
        date.getMonth() + 1, 
        date.getFullYear()
      )
    }
  }

  closeModal() {
    this.dialogRef.close()
  }

  submitForm() {

  }

}
