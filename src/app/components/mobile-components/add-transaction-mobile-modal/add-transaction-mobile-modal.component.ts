import { Component } from '@angular/core';
import { MobileModalService } from 'src/app/services/mobile-modal.service';

@Component({
    selector: 'AddTransactionMobileModal',
    templateUrl: './add-transaction-mobile-modal.component.html',
    styleUrl: './add-transaction-mobile-modal.component.scss',
    host: {
        '[class.full-screen-modal]': 'mobileModalService.isBudgetTransactionsModalOpen()',
        '[class.sheet-modal]': '!mobileModalService.isBudgetTransactionsModalOpen()'
    },
    standalone: false
})
export class AddTransactionMobileModalComponent {
    constructor(public mobileModalService: MobileModalService) {}
}
