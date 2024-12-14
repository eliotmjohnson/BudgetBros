import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'BBLogo',
    templateUrl: './bb-logo.component.html',
    styleUrls: ['./bb-logo.component.scss'],
    imports: [MatIcon]
})
export class BBLogoComponent {
    @Input() fontSize = '';
    @Input() height = '';
    @Input() color = '';
    @Input() translate = '';
}
