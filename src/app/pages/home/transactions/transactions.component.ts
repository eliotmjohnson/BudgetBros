import { Component, OnInit, effect, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
    TransactionModalComponent,
    TransactionModalData
} from 'src/app/components/transaction-modal/transaction-modal.component';
import { TransactionService } from 'src/app/services/transaction.service';
import { getTodayIgnoreTZ } from 'src/app/utils/timeUtils';

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

    constructor() {
        effect(() => {
            if (!this.transactions().length) return;

            const firstTransaction = this.transactions().at(0)!;
            const lastTransaction = this.transactions().at(-1)!;

            this.form.get('start')?.setValue(new Date(lastTransaction.date));
            this.form.get('end')?.setValue(new Date(firstTransaction.date));
        });
    }

    ngOnInit(): void {
        const today = getTodayIgnoreTZ();

        this.transactionService.getTransactionsBetweenDates(today, today);
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
