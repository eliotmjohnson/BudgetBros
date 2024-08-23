import { Component, Input } from '@angular/core';

@Component({
    selector: 'InlineTransaction',
    templateUrl: './inline-transaction.component.html',
    styleUrl: './inline-transaction.component.scss'
})
export class InlineTransactionComponent {
    @Input() title = '';
    @Input() amount = 0;
}
