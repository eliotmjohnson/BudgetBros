import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BudgetCategory } from 'src/app/models/budget';
import { BudgetService } from 'src/app/services/budget.service';
import { TransactionService } from 'src/app/services/transaction.service';

export type TransactionModalData = {
  mode: 'add' | 'edit'
}

@Component({
  selector: 'app-transaction-modal',
  templateUrl: './transaction-modal.component.html',
  styleUrl: './transaction-modal.component.scss'
})
export class TransactionModalComponent {
  readonly dialogRef = inject(MatDialogRef<TransactionModalComponent>);
  modalData = inject<TransactionModalData>(MAT_DIALOG_DATA);
  transactionService = inject(TransactionService);
  budgetService = inject(BudgetService);

  budgetCategoriesData!: BudgetCategory[];

  closeModal() {
    this.dialogRef.close()
  }

  submitForm() {

  }

}
