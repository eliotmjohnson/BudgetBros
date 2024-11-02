import { Component } from '@angular/core';
import { BudgetCategoryService } from 'src/app/services/budget-category.service';
import { MobileModalService } from 'src/app/services/mobile-modal.service';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
    selector: 'app-tabs-bar',
    templateUrl: './tabs-bar.component.html',
    styleUrl: './tabs-bar.component.scss',
    host: {
        '[class.modal-open]':
            'mobileModalService.isAddTransactionModalOpen() || mobileModalService.isBudgetTransactionsModalOpen()',
        '[class.is-reordering]': 'mobileModalService.isReorderingCategories()'
    }
})
export class TabsBarComponent {
    constructor(
        public mobileModalService: MobileModalService,
        private transactionService: TransactionService,
        private budgetCategoryService: BudgetCategoryService
    ) {}

    openAddTransactionModal() {
        if (this.mobileModalService.isBudgetTransactionsModalOpen()) {
            this.mobileModalService.mobileModalData = {
                mode: 'budgetTransactionsAdd',
                lineItemId:
                    this.transactionService.currentSelectedLineItem()
                        ?.lineItemId
            };
        } else {
            this.mobileModalService.mobileModalData = {
                mode: 'budgetTransactionsAddMobile'
            };
        }

        this.mobileModalService.isAddTransactionModalOpen.set(true);
    }
}
