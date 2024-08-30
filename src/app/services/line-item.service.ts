import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { BE_API_URL } from '../constants/constants';
import { SaveLineItemPayload, UpdateLineItemPayload } from '../models/lineItem';
import { BBSnagService } from './bb-snag.service';
import { BudgetService } from './budget.service';

@Injectable({
    providedIn: 'root'
})
export class LineItemService {
    baseUrl = `${BE_API_URL}/line_items`;
    newlyAddedLineItemId = new Subject<string>();

    constructor(
        private http: HttpClient,
        private snagDiaglogService: BBSnagService,
        private budgetService: BudgetService
    ) {}

    saveNewLineItem(saveLineItemPayload: SaveLineItemPayload) {
        this.http
            .post<string>(`${this.baseUrl}`, saveLineItemPayload)
            .subscribe({
                next: (res) => {
                    this.newlyAddedLineItemId.next(res);
                }
            });
    }

    updateLineItem(updateLineItemPayload: UpdateLineItemPayload) {
        this.http.put(`${this.baseUrl}`, updateLineItemPayload).subscribe();
    }

    deleteLineItem(lineItemId: string) {
        this.http.delete(`${this.baseUrl}/${lineItemId}`).subscribe({
            error: (error) => {
                this.snagDiaglogService.openSnagDialog(error);
                const currentBudget = this.budgetService.budget();
                if (currentBudget) {
                    this.budgetService.getBudget(
                        currentBudget?.monthNumber,
                        currentBudget?.year
                    );
                }
            }
        });
    }
}
