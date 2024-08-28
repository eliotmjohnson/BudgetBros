import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { BE_API_URL } from '../constants/constants';
import { SaveLineItemPayload, UpdateLineItemPayload } from '../models/lineItem';

@Injectable({
    providedIn: 'root'
})
export class LineItemService {
    baseUrl = `${BE_API_URL}/line_items`;
    newlyAddedLineItemId = new Subject<string>();

    constructor(private http: HttpClient) {}

    saveNewLineItem(saveLineItemPayload: SaveLineItemPayload) {
        this.http
            .post<string>(`${this.baseUrl}`, saveLineItemPayload)
            .subscribe({
                next: (res) => {
                    this.newlyAddedLineItemId.next(res);
                },
                error: (error) => {
                    console.error(error);
                }
            });
    }

    updateLineItem(updateLineItemPayload: UpdateLineItemPayload) {
        this.http.put(`${this.baseUrl}`, updateLineItemPayload).subscribe({
            next: (res) => {
                console.log(res);
            },
            error: (error) => {
                console.error(error);
            }
        });
    }
}
