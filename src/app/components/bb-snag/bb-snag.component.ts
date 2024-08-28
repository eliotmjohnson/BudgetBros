import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
    errorResponse: HttpErrorResponse;
}

@Component({
    selector: 'BBSnag',
    templateUrl: './bb-snag.component.html',
    styleUrl: './bb-snag.component.scss'
})
export class BBSnagComponent implements OnInit {
    errorMessage = '';

    constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}

    ngOnInit(): void {
        switch (this.data.errorResponse.status) {
            case 500:
                this.errorMessage =
                    'It looks like we are having issues at the moment. Please try again later.';
                break;
        }
    }
}
