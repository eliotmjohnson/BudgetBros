import { Injectable, inject, signal } from '@angular/core';
import { Transaction } from '../models/budget';
import { HttpClient } from '@angular/common/http';
import { BE_API_URL } from '../constants/constants';
import { AuthService } from './auth.service';

const baseUrl = `${BE_API_URL}/transactions`;

@Injectable({
    providedIn: 'root'
})
export class TransactionService {
    http = inject(HttpClient);
    authService = inject(AuthService);

    transactions = signal<Transaction[]>([]);  
    isLoading = signal(false);
    
    getTransactionsBetweenDates(date1: Date, date2: Date) {
        this.isLoading.set(true);
        this.http
            .get<Transaction[]>(`
                ${baseUrl}/${this.authService.userId}?start_date=${date1.toISOString()}&end_date=${date2.toISOString()}
            `)
            .subscribe({
                next: (transactions) => {
                    this.isLoading.set(false);
                    this.transactions.set(transactions);
                },
                error: (error) => {
                    this.isLoading.set(false);
                    console.error(error);
                }
            });
    }

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
