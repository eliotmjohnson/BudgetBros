import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'LinkButton',
    templateUrl: './link-button.component.html',
    styleUrls: ['./link-button.component.scss']
})
export class LinkButtonComponent {
    @Input() description = '';
    @Input() iconName = '';
    @Input() variant = '';
    @Input() isActive = false;
    @Output() onClick = new EventEmitter<string>();
}
