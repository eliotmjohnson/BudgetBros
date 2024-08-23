import { Injectable } from '@angular/core';
import { Transaction } from '../models/budget';

@Injectable({
    providedIn: 'root'
})
export class TransactionService {
    currentSelectedLineItem = '';
    currentSelectedLineItemId = 0;
    currentSelectedLineItemBalance = 0;
    currentTransactionData: Transaction[] = [];

    clearTransactionData() {
        this.currentSelectedLineItem = '';
        this.currentSelectedLineItemId = 0;
        this.currentSelectedLineItemBalance = 0;
        this.currentTransactionData = [];
    }

    isTransactionDataEmpty() {
        return this.currentTransactionData.length === 0;
    }
}
