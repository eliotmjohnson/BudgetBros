import { Component, Input } from '@angular/core';

@Component({
    selector: 'Card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
    host: {
        '[style]': '{ width: width, height: height}'
    }
})
export class CardComponent {
    @Input() width = '';
    @Input() height = '';
}
