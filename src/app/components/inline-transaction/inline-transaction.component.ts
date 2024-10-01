import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MONTHS } from 'src/app/constants/constants';
import { IsolatedTransaction } from 'src/app/models/transaction';
import { LineItemService } from 'src/app/services/line-item.service';
import { MobileModalService } from 'src/app/services/mobile-modal.service';
import { TransactionService } from 'src/app/services/transaction.service';
import {
    TransactionModalComponent,
    TransactionModalData
} from '../transaction-modal/transaction-modal.component';

@Component({
    selector: 'InlineTransaction',
    templateUrl: './inline-transaction.component.html',
    styleUrl: './inline-transaction.component.scss'
})
export class InlineTransactionComponent {
    @Input() transactionId?: string | undefined;
    @Input() title = '';
    @Input() amount = 0;
    @Input() merchant: string | null = '';
    @Input() notes = '';
    @Input({ transform: (date: string) => new Date(date) }) date!: Date;

    constructor(
        private transactionService: TransactionService,
        private lineItemService: LineItemService,
        private dialog: MatDialog,
        public mobileService: MobileModalService
    ) {}

    getMonth() {
        const foundMonth = MONTHS.find(
            (_, index) => index === this.date.getMonth()
        );

        return foundMonth?.slice(0, 3);
    }

    deleteTransaction(e: MouseEvent) {
        e.stopPropagation();

        this.transactionService.softDeleteTransaction(this.transactionId!);
        const foundLineItem = this.lineItemService.fetchLineItem(
            this.transactionService.currentSelectedLineItemId()
        );

        if (foundLineItem) {
            foundLineItem.transactions = foundLineItem.transactions.filter(
                (transaction) => {
                    return transaction.transactionId !== this.transactionId;
                }
            );
        }
    }

    editTransaction() {
        const transactionToUpdate = {
            transactionId: this.transactionId,
            amount: this.amount,
            date: this.date.toDateString(),
            deleted: false,
            lineItemId: this.transactionService.currentSelectedLineItemId(),
            merchant: this.merchant,
            notes: this.notes,
            title: this.title
        } as IsolatedTransaction;

        this.dialog.open<TransactionModalComponent, TransactionModalData>(
            TransactionModalComponent,
            {
                data: {
                    mode: 'budgetTransactionsEdit',
                    transaction: transactionToUpdate,
                    lineItemId:
                        this.transactionService.currentSelectedLineItemId()
                }
            }
        );
    }
}
