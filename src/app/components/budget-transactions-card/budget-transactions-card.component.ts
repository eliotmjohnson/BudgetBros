import { Component } from '@angular/core';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
    selector: 'BudgetTransactionsCard',
    templateUrl: './budget-transactions-card.component.html',
    styleUrl: './budget-transactions-card.component.scss'
})
export class BudgetTransactionsCardComponent {
    constructor(public transactionService: TransactionService) {}
}
