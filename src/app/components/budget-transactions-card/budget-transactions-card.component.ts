import { Component, computed, Input } from '@angular/core';
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
    progress = computed(() => {
        return (
            (this.transactionService.currentSelectedLineItem()!
                .remainingAmount /
                this.transactionService.currentSelectedLineItem()!
                    .plannedAmount) *
                100 || 0
        );
    });

    getProgressStyle = computed(() => {
        return this.progress() < 0
            ? '#e55b66'
            : this.progress()
              ? `conic-gradient(
                    rgb(109, 206, 109) ${this.progress()}%,
                    rgb(223, 223, 223) ${100 - this.progress()}%
                )`
              : 'rgb(223, 223, 223)';
    });

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
                lineItemId:
                    this.transactionService.currentSelectedLineItem()
                        ?.lineItemId
            }
        });
    }
}
