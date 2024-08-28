import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SaveLineItemPayload } from '../models/line-item';
import { BE_API_URL } from '../constants/constants';
import { BudgetService } from './budget.service';

@Injectable({
    providedIn: 'root'
})
export class LineItemService {
    baseUrl = `${BE_API_URL}/line_items`;

    constructor(
        private http: HttpClient,
        private budgetService: BudgetService
    ) {}

    saveNewLineItem(saveLineItemPayload: SaveLineItemPayload) {
        this.http.post(`${this.baseUrl}`, saveLineItemPayload).subscribe({
            next: (res) => {
                console.log(res);
                const currentBudget = this.budgetService.budget();
                if (currentBudget) {
                    this.budgetService.getBudget(
                        currentBudget?.monthNumber,
                        currentBudget?.year
                    );
                }
            },
            error: (error) => {
                console.error(error);
            }
        });
    }
}
