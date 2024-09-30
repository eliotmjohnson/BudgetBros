import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { BE_API_URL } from '../constants/constants';
import {
    LineItem,
    SaveLineItemPayload,
    UpdateLineItemPayload
} from '../models/lineItem';
import { BudgetService } from './budget.service';

@Injectable({
    providedIn: 'root'
})
export class LineItemService {
    baseUrl = `${BE_API_URL}/line_items`;
    newlyAddedLineItemId = new Subject<string>();

    constructor(
        private http: HttpClient,
        private budgetService: BudgetService
    ) {}

    saveNewLineItem(saveLineItemPayload: SaveLineItemPayload) {
        this.http
            .post<string>(`${this.baseUrl}`, saveLineItemPayload)
            .subscribe({
                next: (res) => {
                    this.newlyAddedLineItemId.next(res);
                },
                error: (error) => {
                    this.newlyAddedLineItemId.next('');
                    this.budgetService.openSnagDialogAndRefresh(error);
                }
            });
    }

    updateLineItem(updateLineItemPayload: UpdateLineItemPayload) {
        this.http.put(`${this.baseUrl}`, updateLineItemPayload).subscribe({
            error: (error) => {
                this.budgetService.openSnagDialogAndRefresh(error);
            }
        });
    }

    deleteLineItem(lineItemId: string) {
        this.http.delete(`${this.baseUrl}/${lineItemId}`).subscribe({
            error: (error) => {
                this.budgetService.openSnagDialogAndRefresh(error);
            }
        });
    }

    fetchLineItem(lineItemId: string): LineItem | undefined {
        let fetchedLineItem: LineItem | undefined = undefined;

        this.budgetService.budget()?.budgetCategories.some((budgetCategory) => {
            const result = budgetCategory.lineItems.find(
                (lineItem) => lineItem.lineItemId === lineItemId
            );
            if (result) {
                fetchedLineItem = result;
                return true;
            }
            return false;
        });

        return fetchedLineItem;
    }
}
