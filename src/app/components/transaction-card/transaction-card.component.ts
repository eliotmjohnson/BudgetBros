import { Component, input } from '@angular/core';
import { IsolatedTransaction } from 'src/app/models/transaction';

@Component({
  selector: 'TransactionCard',
  templateUrl: './transaction-card.component.html',
  styleUrl: './transaction-card.component.scss'
})
export class TransactionCardComponent {
  transaction = input.required<IsolatedTransaction>();
}
