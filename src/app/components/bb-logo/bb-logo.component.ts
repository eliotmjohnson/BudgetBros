import { Component, Input } from '@angular/core';

@Component({
    selector: 'BBLogo',
    templateUrl: './bb-logo.component.html',
    styleUrls: ['./bb-logo.component.scss'],
    standalone: false
})
export class BBLogoComponent {
    @Input() fontSize = '';
    @Input() height = '';
    @Input() color = '';
    @Input() translate = '';
}
