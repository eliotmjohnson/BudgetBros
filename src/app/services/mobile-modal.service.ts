import { Injectable, signal } from '@angular/core';
import { TransactionModalData } from '../components/transaction-modal/transaction-modal.component';

@Injectable({
    providedIn: 'root'
})
export class MobileModalService {
    isMobileDevice = signal(false);
    isAddTransactionModalOpen = signal(false);
    isBudgetTransactionsModalOpen = signal(false);
    isIOSDevice = signal(false);
    showPlannedAmounts = signal(false);

    mobileModalData: TransactionModalData = { mode: 'add' };

    constructor() {
        const userAgent = window.navigator.userAgent;
        this.isIOSDevice.set(/iPhone/i.test(userAgent));
    }
}
