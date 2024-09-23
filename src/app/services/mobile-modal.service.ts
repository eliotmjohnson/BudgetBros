import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class MobileModalService {
    isMobileDevice = signal(false);
    isAddTransactionModalOpen = signal(false);
    isBudgetTransactionsModalOpen = signal(false);
    isIOSDevice = signal(false);
    showPlannedAmounts = signal(false);

    constructor() {
        const userAgent = window.navigator.userAgent;
        this.isIOSDevice.set(/iPhone/i.test(userAgent));
    }
}
