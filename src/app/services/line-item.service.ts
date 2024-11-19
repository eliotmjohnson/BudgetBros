import { HttpClient } from '@angular/common/http';
import { effect, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { BE_API_URL } from '../constants/constants';
import {
    LineItem,
    SaveLineItemPayload,
    UpdateFundPayload,
    UpdateLineItemPayload
} from '../models/lineItem';
import { BudgetService } from './budget.service';

@Injectable({
    providedIn: 'root'
})
export class LineItemService {
    baseUrl = `${BE_API_URL}/line_items`;
    newlyAddedLineItemId = new Subject<string>();
    fetchedLineItem: LineItem | undefined = undefined;

    constructor(
        private http: HttpClient,
        private budgetService: BudgetService
    ) {
        effect(() => {
            if (budgetService.budget()) {
                this.fetchedLineItem = undefined;
            }
        });
    }

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

    deleteLineItem(
        lineItemId: string,
        lineItemOrder: string[],
        budgetCategoryId: string
    ) {
        this.http
            .delete(`${this.baseUrl}/${lineItemId}`, {
                body: { lineItemOrder, budgetCategoryId }
            })
            .subscribe({
                error: (error) => {
                    this.budgetService.openSnagDialogAndRefresh(error);
                }
            });
    }

    fetchLineItem(lineItemId: string): LineItem | undefined {
        if (
            !this.fetchedLineItem ||
            this.fetchedLineItem.lineItemId !== lineItemId
        ) {
            this.budgetService
                .budget()
                ?.budgetCategories.some((budgetCategory) => {
                    const result = budgetCategory.lineItems.find(
                        (lineItem) => lineItem.lineItemId === lineItemId
                    );
                    if (result) {
                        this.fetchedLineItem = result;
                        return true;
                    }
                    return false;
                });
        }

        return this.fetchedLineItem;
    }

    updateLineItemOrder(lineItemIds: string[], budgetCategoryId: string) {
        this.http
            .post(`${this.baseUrl}/reorder/${budgetCategoryId}`, lineItemIds)
            .subscribe({
                error: (error) => {
                    this.budgetService.openSnagDialogAndRefresh(error);
                }
            });
    }

    updateFund(lineItemId: string, updateFundPayload: UpdateFundPayload) {
        this.http
            .patch<string>(
                `${this.baseUrl}/fund/${lineItemId}`,
                updateFundPayload
            )
            .subscribe({
                next: (fundId) => {
                    if (updateFundPayload.isAddingFund) {
                        const fetchedLineItem = this.fetchLineItem(lineItemId);
                        if (fetchedLineItem) {
                            fetchedLineItem.fundId = fundId;
                        }
                    }
                },
                error: (error) => {
                    this.budgetService.openSnagDialogAndRefresh(error);
                }
            });
    }
}
