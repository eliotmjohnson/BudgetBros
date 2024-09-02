import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
    TransactionModalComponent,
    TransactionModalData
} from 'src/app/components/transaction-modal/transaction-modal.component';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
    selector: 'app-transactions',
    templateUrl: './transactions.component.html',
    styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
    transactionService = inject(TransactionService);
    dialog = inject(MatDialog);

    form = new FormGroup({
        start: new FormControl<Date | null>(new Date()),
        end: new FormControl<Date | null>(new Date())
    });

    transactions = this.transactionService.transactions;

    ngOnInit(): void {
        this.transactionService.getTransactionsBetweenDates(
            new Date(),
            new Date()
        );
    }

    openAddTransactionDialog() {
        this.dialog.open<TransactionModalComponent, TransactionModalData>(
            TransactionModalComponent,
            { data: { mode: 'add' } }
        );
    }

    submitForm() {
        const start = this.form.get('start')?.value;
        const end = this.form.get('end')?.value;

        if (start && end) {
            this.transactionService.getTransactionsBetweenDates(start, end);
        }
    }
}
