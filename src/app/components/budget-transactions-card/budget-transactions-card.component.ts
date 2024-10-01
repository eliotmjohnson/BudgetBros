import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MobileModalService } from 'src/app/services/mobile-modal.service';
import { TransactionService } from 'src/app/services/transaction.service';
import {
    TransactionModalComponent,
    TransactionModalData
} from '../transaction-modal/transaction-modal.component';

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
        private mobileModalService: MobileModalService,
        private dialogService: MatDialog
    ) {}

    closeBudgetTransactionsModal() {
        this.transactionService.clearSelectedTransactionData();
        this.mobileModalService.isBudgetTransactionsModalOpen.set(false);
    }

    openAddTransactionModal() {
        this.dialogService.open<
            TransactionModalComponent,
            TransactionModalData
        >(TransactionModalComponent, {
            data: {
                mode: 'budgetTransactionsAdd',
                lineItemId: this.transactionService.currentSelectedLineItemId()
            }
        });
    }
}
