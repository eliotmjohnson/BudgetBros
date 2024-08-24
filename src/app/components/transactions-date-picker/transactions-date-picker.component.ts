import { Component } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'TransactionsDatePicker',
  templateUrl: './transactions-date-picker.component.html',
  styleUrl: './transactions-date-picker.component.scss',
  providers: [provideNativeDateAdapter()]
})
export class TransactionsDatePickerComponent {
  
}
