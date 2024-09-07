import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { Component, input } from '@angular/core';

@Component({
    selector: 'TransactionsFilterPopover',
    templateUrl: './transactions-filter-popover.component.html',
    styleUrl: './transactions-filter-popover.component.scss'
})
export class TransactionsFilterPopoverComponent {
    trigger = input.required<CdkOverlayOrigin>();
    isFilterPopoverOpen = input.required<boolean>();
}
