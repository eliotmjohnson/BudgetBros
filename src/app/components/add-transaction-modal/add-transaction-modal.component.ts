import { Component, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-transaction-modal',
  templateUrl: './add-transaction-modal.component.html',
  styleUrl: './add-transaction-modal.component.scss'
})
export class AddTransactionModalComponent {
  readonly dialogRef = inject(MatDialogRef<AddTransactionModalComponent>);

  closeModal() {
    this.dialogRef.close()
  }

}
