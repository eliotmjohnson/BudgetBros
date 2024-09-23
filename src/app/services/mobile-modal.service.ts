import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class MobileModalService {
    isMobileDevice = signal(false);
    isAddTransactionModalOpen = signal(false);
    isBudgetTransactionsModalOpen = signal(false);
    showPlannedAmounts = signal(false);
}
