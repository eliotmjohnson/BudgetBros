import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { BBSnagComponent } from '../components/bb-snag/bb-snag.component';
import { HttpErrorResponse } from '@angular/common/http';
import { MobileModalService } from './mobile-modal.service';

@Injectable({
    providedIn: 'root'
})
export class BBSnagService {
    constructor(
        private snagDialog: MatDialog,
        private mobileService: MobileModalService
    ) {}

    openSnagDialog(errorResponse: HttpErrorResponse) {
        const config: MatDialogConfig = {
            data: { errorResponse: errorResponse }
        };

        if (this.mobileService.isMobileDevice()) {
            this.mobileService.closeAllModals();
        }

        const isDialogCurrentlyOpen = this.snagDialog.openDialogs.length;
        if (!isDialogCurrentlyOpen) {
            this.snagDialog.open(BBSnagComponent, config);
        }
    }
}
