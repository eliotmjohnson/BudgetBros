import { Component, Input } from '@angular/core';
import { MobileModalService } from 'src/app/services/mobile-modal.service';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
    selector: 'BudgetTransactionsCard',
    templateUrl: './budget-transactions-card.component.html',
    styleUrl: './budget-transactions-card.component.scss',
    host: {
        '[class.open-budget-transactions-modal]': 'isMobileComponent'
    }
})
export class BudgetTransactionsCardComponent {
    @Input() isMobileComponent = false;

    constructor(
        public transactionService: TransactionService,
        private mobileModalService: MobileModalService
    ) {}

    closeBudgetTransactionsModal() {
        this.transactionService.clearSelectedTransactionData();
        this.mobileModalService.isBudgetTransactionsModalOpen.set(false);
    }
}
