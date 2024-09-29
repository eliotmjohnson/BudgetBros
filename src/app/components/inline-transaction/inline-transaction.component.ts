import { Component, Input } from '@angular/core';
import { MONTHS } from 'src/app/constants/constants';
import { LineItemService } from 'src/app/services/line-item.service';
import { MobileModalService } from 'src/app/services/mobile-modal.service';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
    selector: 'InlineTransaction',
    templateUrl: './inline-transaction.component.html',
    styleUrl: './inline-transaction.component.scss'
})
export class InlineTransactionComponent {
    @Input() transactionId?: string | undefined;
    @Input() title = '';
    @Input() amount = 0;
    @Input() merchant = '';
    @Input() notes = '';
    @Input({ transform: (date: string) => new Date(date) }) date!: Date;

    constructor(
        private transactionService: TransactionService,
        private lineItemService: LineItemService,
        public mobileService: MobileModalService
    ) {}

    getMonth() {
        const foundMonth = MONTHS.find(
            (_, index) => index === this.date.getMonth()
        );

        return foundMonth?.slice(0, 3);
    }

    deleteTransaction() {
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
}
