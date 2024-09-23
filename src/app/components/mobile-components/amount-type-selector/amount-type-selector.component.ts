import { Component } from '@angular/core';
import { MobileModalService } from 'src/app/services/mobile-modal.service';

@Component({
    selector: 'AmountTypeSelector',
    templateUrl: './amount-type-selector.component.html',
    styleUrl: './amount-type-selector.component.scss'
})
export class AmountTypeSelectorComponent {
    constructor(public mobileModalService: MobileModalService) {}
}
