import { Component } from '@angular/core';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';

@Component({
  selector: 'TransactionsDatePicker',
  templateUrl: './transactions-date-picker.component.html',
  styleUrl: './transactions-date-picker.component.scss',
  providers: [provideDateFnsAdapter()]
})
export class TransactionsDatePickerComponent {

}
