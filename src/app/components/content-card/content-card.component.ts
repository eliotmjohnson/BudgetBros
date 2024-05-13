import { Component, Input } from '@angular/core';

@Component({
    selector: 'ContentCard',
    templateUrl: './content-card.component.html',
    styleUrls: ['./content-card.component.scss']
})
export class ContentCardComponent {
    @Input() title = '';
}
