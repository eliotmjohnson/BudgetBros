import { Component, input } from '@angular/core';

@Component({
    selector: 'Card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
    host: {
        '[style]': '{ width: width(), height: height() }'
    },
    standalone: false
})
export class CardComponent {
    readonly width = input('');
    readonly height = input('');
    readonly padding = input('1.5rem');
    readonly paddingBottom = input('');
    readonly paddingLeft = input('');
    readonly paddingRight = input('');
    readonly isBudgetTransactionsModal = input(false);
}
