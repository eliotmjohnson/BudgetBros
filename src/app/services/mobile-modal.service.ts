import { Injectable, signal } from '@angular/core';
import { TransactionModalData } from '../components/transaction-modal/transaction-modal.component';

@Injectable({
    providedIn: 'root'
})
export class MobileModalService {
    isMobileDevice = signal(false);
    isAddTransactionModalOpen = signal(false);
    isBudgetTransactionsModalOpen = signal(false);
    isFeatureModalOpen = signal(false);
    isIOSDevice = signal(false);
    isReorderingCategories = signal(false);
    showPlannedAmounts = signal(false);

    mobileModalData: TransactionModalData = { mode: 'add' };

    constructor() {
        const userAgent = window.navigator.userAgent;
        this.isIOSDevice.set(/iPhone/i.test(userAgent));
    }

    closeAllModals() {
        this.isAddTransactionModalOpen.set(false);
        this.isBudgetTransactionsModalOpen.set(false);
        this.isFeatureModalOpen.set(false);
    }
}
