import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BBLogoComponent } from '../bb-logo/bb-logo.component';

export interface DialogData {
    errorResponse: HttpErrorResponse;
}

@Component({
    selector: 'BBSnag',
    templateUrl: './bb-snag.component.html',
    styleUrl: './bb-snag.component.scss',
    imports: [BBLogoComponent]
})
export class BBSnagComponent implements OnInit {
    errorMessage = '';

    constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}

    ngOnInit(): void {
        const errorResponse = this.data.errorResponse;
        const status = errorResponse.status;

        if (status === 500) {
            this.errorMessage =
                'It looks like our servers are having issues at the moment. Please try again later.';
        } else if (status >= 400 && status < 500) {
            this.errorMessage =
                'It looks like there is a conflict with the request. Please try again.';
        } else {
            this.errorMessage =
                'It looks like our app is having issues at the moment. Please try again later.';
        }
    }
}
