import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { Component, OnInit, input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
    addValueToCurrencyInput,
    checkCurrencyInputKeyValid
} from 'src/app/utils/currencyUtils';

@Component({
    selector: 'TransactionsFilterPopover',
    templateUrl: './transactions-filter-popover.component.html',
    styleUrl: './transactions-filter-popover.component.scss'
})
export class TransactionsFilterPopoverComponent implements OnInit {
    trigger = input.required<CdkOverlayOrigin>();
    isFilterPopoverOpen = input.required<boolean>();

    form = new FormGroup({
        titleOrMerchant: new FormControl<string>(''),
        date: new FormControl<Date | null>(null),
        amount: new FormControl<number | null>(null)
    });

    ngOnInit(): void {
        this.form.valueChanges.subscribe((value) => console.log(value));
    }

    checkIfValidKey(e: KeyboardEvent): boolean {
        return checkCurrencyInputKeyValid(e, this.form.value.amount as number);
    }

    addValue(e: Event) {
        addValueToCurrencyInput(e, this.form);
    }
}
