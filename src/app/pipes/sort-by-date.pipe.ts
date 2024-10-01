import { Pipe, PipeTransform } from '@angular/core';
import { Transaction } from '../models/transaction';

@Pipe({
    name: 'sortByDate'
})
export class SortByDatePipe implements PipeTransform {
    transform(transactions: Transaction[]): Transaction[] {
        return transactions.sort((a, b) => {
            const aDate = new Date(a.date).getDate();
            const bDate = new Date(b.date).getDate();

            return bDate - aDate;
        });
    }
}
