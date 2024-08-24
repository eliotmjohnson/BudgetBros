import { Component, OnInit, inject } from '@angular/core';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  transactionService = inject(TransactionService)

  transactions = this.transactionService.transactions;

  ngOnInit(): void {
    this.transactionService
      .getTransactionsBetweenDates((new Date(2024, 7, 19)), new Date(2024, 7, 22))
  }

}
