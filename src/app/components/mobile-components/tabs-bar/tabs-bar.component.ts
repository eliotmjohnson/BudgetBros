import { Component } from '@angular/core';
import { MobileModalService } from 'src/app/services/mobile-modal.service';

@Component({
    selector: 'app-tabs-bar',
    templateUrl: './tabs-bar.component.html',
    styleUrl: './tabs-bar.component.scss',
    host: {
        '[class.modal-open]':
            'mobileModalService.isAddTransactionModalOpen() || mobileModalService.isBudgetTransactionsModalOpen()'
    }
})
export class TabsBarComponent {
    constructor(public mobileModalService: MobileModalService) {}
}
