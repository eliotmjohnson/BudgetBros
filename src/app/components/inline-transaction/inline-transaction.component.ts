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
    styleUrl: './inline-transaction.component.scss',
    host: {
        '[@.disabled]': '!isDeletingTransaction'
    }
})
export class InlineTransactionComponent {
    @Input() transactionId?: string | undefined;
    @Input() title = '';
    @Input() amount = 0;
    @Input() merchant: string | null = '';
    @Input() notes = '';
    @Input() isIncomeTransaction = false;
    @Input({ transform: (date: string) => new Date(date) }) date!: Date;
    isDeletingTransaction = false;

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

    deleteTransaction(e?: MouseEvent) {
        this.isDeletingTransaction = true;
        if (e) e.stopPropagation();

        this.transactionService.softDeleteTransaction(this.transactionId!);
        const foundLineItem = this.lineItemService.fetchLineItem(
            this.transactionService.currentSelectedLineItem()?.lineItemId || ''
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
            lineItemId:
                this.transactionService.currentSelectedLineItem()?.lineItemId,
            merchant: this.merchant,
            notes: this.notes,
            title: this.title,
            isIncomeTransaction: this.isIncomeTransaction
        } as IsolatedTransaction;

        if (!this.mobileService.isMobileDevice()) {
            this.dialog.open<TransactionModalComponent, TransactionModalData>(
                TransactionModalComponent,
                {
                    data: {
                        mode: 'budgetTransactionsEdit',
                        transaction: transactionToUpdate,
                        lineItemId:
                            this.transactionService.currentSelectedLineItem()
                                ?.lineItemId
                    }
                }
            );
        } else {
            this.mobileService.mobileModalData = {
                mode: 'budgetTransactionsEdit',
                transaction: transactionToUpdate,
                lineItemId:
                    this.transactionService.currentSelectedLineItem()
                        ?.lineItemId
            };
            this.mobileService.isAddTransactionModalOpen.set(true);
        }
    }
}
