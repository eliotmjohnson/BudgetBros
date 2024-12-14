import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'LinkButton',
    templateUrl: './link-button.component.html',
    styleUrls: ['./link-button.component.scss'],
    imports: [MatIcon, RouterLink, MatButtonModule, CommonModule]
})
export class LinkButtonComponent {
    @Input() description = '';
    @Input() iconName = '';
    @Input() variant = '';
    @Input() isActive = false;
    @Output() handleClick = new EventEmitter<string>();
}
