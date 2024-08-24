import { Component, inject, input } from '@angular/core';
import { IsolatedTransaction } from 'src/app/models/transaction';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
  selector: 'TransactionCard',
  templateUrl: './transaction-card.component.html',
  styleUrl: './transaction-card.component.scss'
})
export class TransactionCardComponent {
  transactionService = inject(TransactionService);

  transaction = input.required<IsolatedTransaction>();

  deleteTransaction(transactionId: number) {
    this.transactionService.softDeleteTransaction(transactionId)
  }
}
