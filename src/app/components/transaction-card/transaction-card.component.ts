import { Component, inject, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IsolatedTransaction } from 'src/app/models/transaction';
import { TransactionService } from 'src/app/services/transaction.service';
import {
    TransactionModalComponent,
    TransactionModalData
} from '../transaction-modal/transaction-modal.component';

@Component({
    selector: 'TransactionCard',
    templateUrl: './transaction-card.component.html',
    styleUrl: './transaction-card.component.scss'
})
export class TransactionCardComponent {
    transactionService = inject(TransactionService);
    dialog = inject(MatDialog);

    transaction = input.required<IsolatedTransaction>();

    deleteTransaction(transactionId: IsolatedTransaction['id']) {
        this.transactionService.softDeleteTransaction(transactionId);
    }

    openEditModal() {
        this.dialog.open<TransactionModalComponent, TransactionModalData>(
            TransactionModalComponent,
            {
                data: {
                    mode: 'edit',
                    transaction: this.transaction()
                }
            }
        );
    }
}
