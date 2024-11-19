import { Component, Input } from '@angular/core';

@Component({
    selector: 'Card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
    host: {
        '[style]': '{ width: width, height: height }'
    },
    standalone: false
})
export class CardComponent {
    @Input() width = '';
    @Input() height = '';
    @Input() padding = '1.5rem';
    @Input() paddingBottom = '';
    @Input() paddingLeft = '';
    @Input() isBudgetTransactionsModal = false;
}
