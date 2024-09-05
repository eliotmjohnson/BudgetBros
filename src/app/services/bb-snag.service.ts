import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { BBSnagComponent } from '../components/bb-snag/bb-snag.component';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class BBSnagService {
    constructor(private snagDialog: MatDialog) {}

    openSnagDialog(errorResponse: HttpErrorResponse) {
        const config: MatDialogConfig = {
            data: { errorResponse: errorResponse }
        };

        this.snagDialog.closeAll();
        this.snagDialog.open(BBSnagComponent, config);
    }
}
