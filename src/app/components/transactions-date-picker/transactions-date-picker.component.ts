import { Component, OnInit, input, output } from '@angular/core';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import {
    MatDatepickerToggle,
    MatDateRangeInput,
    MatDateRangePicker
} from '@angular/material/datepicker';
import { MatFormFieldModule, MatSuffix } from '@angular/material/form-field';

@Component({
    selector: 'TransactionsDatePicker',
    templateUrl: './transactions-date-picker.component.html',
    styleUrl: './transactions-date-picker.component.scss',
    imports: [
        MatFormFieldModule,
        MatDateRangeInput,
        MatDateRangePicker,
        MatDatepickerToggle,
        ReactiveFormsModule,
        MatSuffix
    ]
})
export class TransactionsDatePickerComponent implements OnInit {
    form = input.required<UntypedFormGroup>();
    submitForm = output();

    private originalStartValue: Date | null = null;
    private originalEndValue: Date | null = null;

    ngOnInit() {
        this.originalStartValue = this.form().get('start')?.value;
        this.originalEndValue = this.form().get('end')?.value;
    }

    submit() {
        if (this.form().invalid) return;

        const currentStartValue = this.form().get('start')?.value;
        const currentEndValue = this.form().get('end')?.value;

        const startChanged =
            currentStartValue.getDate() !== this.originalStartValue?.getDate();
        const endChanged =
            currentEndValue.getDate() !== this.originalEndValue?.getDate();

        this.originalStartValue = currentStartValue;
        this.originalEndValue = currentEndValue;

        if (startChanged || endChanged) {
            this.submitForm.emit();
        }
    }
}
