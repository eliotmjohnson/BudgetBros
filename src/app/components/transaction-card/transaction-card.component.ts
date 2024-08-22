import { Component, input } from '@angular/core';

@Component({
  selector: 'TransactionCard',
  templateUrl: './transaction-card.component.html',
  styleUrl: './transaction-card.component.scss'
})
export class TransactionCardComponent {
  title = input.required<string>();
  merchant = input.required<string>();
  budgetCategoryName = input.required<string>();
  date = input.required<string>();
  amount = input.required<number>();

}
