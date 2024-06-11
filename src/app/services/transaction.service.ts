import { Injectable } from '@angular/core';
import { Transaction } from '../models/budget';

@Injectable({
    providedIn: 'root'
})
export class TransactionService {
    currentTransactionData: Transaction[] = [];
}
