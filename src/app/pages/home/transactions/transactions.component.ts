import {
    Component,
    OnInit,
    computed,
    effect,
    inject,
    signal
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
    TransactionModalComponent,
    TransactionModalData
} from 'src/app/components/transaction-modal/transaction-modal.component';
import { TransactionService } from 'src/app/services/transaction.service';
import { addValueToCurrencyInput } from 'src/app/utils/currencyUtils';
import { getTodayMidnight } from 'src/app/utils/timeUtils';

@Component({
    selector: 'app-transactions',
    templateUrl: './transactions.component.html',
    styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
    transactionService = inject(TransactionService);
    dialog = inject(MatDialog);

    form = new FormGroup({
        start: new FormControl<Date | null>(new Date()),
        end: new FormControl<Date | null>(new Date())
    });

    transactions = this.transactionService.transactions;

    isFilterOpen = signal(false);
    filterFields = signal([
        {
            title: 'Title',
            value: ''
        },
        {
            title: 'Amount',
            value: ''
        },
        {
            title: 'Merchant',
            value: ''
        }
    ]);

    filteredTransactions = computed(() => {
        const transactions = this.transactions();
        const [titleField, amountField, merchantField] = this.filterFields();

        return transactions.filter((transaction) => {
            const titleFilter = titleField.value
                ? transaction.title
                      ?.toLowerCase()
                      .includes(titleField.value.toLowerCase())
                : true;

            const amountFilter = amountField.value
                ? transaction.amount.toString().startsWith(amountField.value)
                : true;

            const merchantFilter = merchantField.value
                ? transaction.merchant
                      .toLowerCase()
                      .includes(merchantField.value.toLowerCase())
                : true;

            return titleFilter && amountFilter && merchantFilter;
        });
    });

    constructor() {
        effect(() => {
            if (!this.transactions().length) return;

            const firstTransaction = this.transactions().at(0)!;
            const lastTransaction = this.transactions().at(-1)!;

            this.form.get('start')?.setValue(new Date(lastTransaction.date));
            this.form.get('end')?.setValue(new Date(firstTransaction.date));
        });
    }

    ngOnInit(): void {
        const today = getTodayMidnight();

        this.transactionService.getTransactionsBetweenDates(today, today);
    }

    updateFilters(fieldTitle: string, e?: Event) {
        const value = (e?.target as HTMLInputElement)?.value;
        const isAmountField = fieldTitle === 'Amount';

        this.filterFields.update((prevFilters) => {
            return prevFilters.map((filter) => ({
                title: filter.title,
                value:
                    filter.title === fieldTitle
                        ? value
                            ? isAmountField
                                ? addValueToCurrencyInput(e!).toString()
                                : value
                            : ''
                        : filter.value
            }));
        });
    }

    openAddTransactionDialog() {
        this.dialog.open<TransactionModalComponent, TransactionModalData>(
            TransactionModalComponent,
            { data: { mode: 'add' } }
        );
    }

    submitForm() {
        const start = this.form.get('start')?.value;
        const end = this.form.get('end')?.value;

        if (start && end) {
            this.transactionService.getTransactionsBetweenDates(start, end);
        }
    }

    toggleFilter() {
        this.isFilterOpen.set(!this.isFilterOpen());
    }
}
