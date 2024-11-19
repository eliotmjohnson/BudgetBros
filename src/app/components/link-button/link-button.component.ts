import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'LinkButton',
    templateUrl: './link-button.component.html',
    styleUrls: ['./link-button.component.scss'],
    standalone: false
})
export class LinkButtonComponent {
    @Input() description = '';
    @Input() iconName = '';
    @Input() variant = '';
    @Input() isActive = false;
    @Output() handleClick = new EventEmitter<string>();
}
