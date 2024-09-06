import { Component, Input } from '@angular/core';
import { MONTHS } from 'src/app/constants/constants';

@Component({
    selector: 'InlineTransaction',
    templateUrl: './inline-transaction.component.html',
    styleUrl: './inline-transaction.component.scss'
})
export class InlineTransactionComponent {
    @Input() title = '';
    @Input() amount = 0;
    @Input() merchant = '';
    @Input() notes = '';
    @Input({ transform: (date: string) => new Date(date) }) date!: Date;

    getMonth() {
        const foundMonth = MONTHS.find(
            (_, index) => index === this.date.getMonth()
        );

        return foundMonth?.slice(0, 3);
    }
}
