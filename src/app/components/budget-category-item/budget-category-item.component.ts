import { Component, Input } from '@angular/core';
import { Transaction } from 'src/app/models/budget';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
    selector: 'BudgetCategoryItem',
    templateUrl: './budget-category-item.component.html',
    styleUrls: ['./budget-category-item.component.scss']
})
export class BudgetCategoryItemComponent {
    @Input() itemTitle = '';
    @Input() startingBalance = 0;
    @Input() plannedAmount = 0;
    @Input() fund = false;
    @Input() transactions?: Transaction[];
    progressPercentage = 30;

    constructor(private transactionService: TransactionService) {}

    get remainingAmount() {
        return this.startingBalance - this.plannedAmount;
    }

    setTransactionData() {
        this.transactionService.currentTransactionData = this.transactions
            ? this.transactions
            : [];
    }
}
