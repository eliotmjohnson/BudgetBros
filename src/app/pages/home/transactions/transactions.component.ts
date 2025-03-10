import {
    Component,
    OnInit,
    computed,
    effect,
    inject,
    linkedSignal,
    signal
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
    TransactionModalComponent,
    TransactionModalData
} from 'src/app/components/transaction-modal/transaction-modal.component';
import { IsolatedTransaction, Transaction } from 'src/app/models/transaction';
import { TransactionService } from 'src/app/services/transaction.service';
import {
    addValueToCurrencyInput,
    checkCurrencyInputKeyValid
} from 'src/app/utils/currencyUtils';
import { getTodayMidnight } from 'src/app/utils/timeUtils';

type MaybeTransaction = IsolatedTransaction[] | Transaction[] | undefined;

@Component({
    selector: 'app-transactions',
    templateUrl: './transactions.component.html',
    styleUrls: ['./transactions.component.scss'],
    standalone: false
})
export class TransactionsComponent implements OnInit {
    transactionService = inject(TransactionService);
    dialog = inject(MatDialog);

    form = new FormGroup({
        start: new FormControl<Date | null>(new Date()),
        end: new FormControl<Date | null>(new Date())
    });

    transactions = this.transactionService.transactions.value;
    untrackedTransactions = this.transactionService.untrackedTransactions.value;
    deletedTransactions = this.transactionService.deletedTransactions.value;

    areTransactionsLoading = this.transactionService.transactions.isLoading;

    areUntrackedTransactionsBeingViewed = signal(false);
    areDeletedTransactionsBeingViewed = signal(false);
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

    filteredTransactions = linkedSignal<MaybeTransaction>(() => {
        const untrackedTransactions = this.untrackedTransactions();
        const deletedTransactions = this.deletedTransactions();

        let currentViewedTransactions: MaybeTransaction;

        switch (true) {
            case this.areDeletedTransactionsBeingViewed():
                currentViewedTransactions = deletedTransactions;
                break;
            case this.areUntrackedTransactionsBeingViewed():
                currentViewedTransactions = untrackedTransactions;
                break;
            default:
                currentViewedTransactions = this.transactions();
        }

        const [titleField, amountField, merchantField] = this.filterFields();

        return currentViewedTransactions?.filter((transaction) => {
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
                      ?.toLowerCase()
                      .includes(merchantField.value.toLowerCase())
                : true;

            return titleFilter && amountFilter && merchantFilter;
        });
    });

    filtersHaveValue = computed(() =>
        this.filterFields().some((filter) => filter.value)
    );

    constructor() {
        effect(() => {
            if (!this.transactions()?.length) return;

            const firstTransaction = this.transactions()!.at(0)!;
            const lastTransaction = this.transactions()!.at(-1)!;

            this.form.get('start')?.setValue(new Date(lastTransaction.date));
            this.form.get('end')?.setValue(new Date(firstTransaction.date));
        });
    }

    ngOnInit(): void {
        const today = getTodayMidnight();

        this.transactionService.selectedStartDate.set(today);
        this.transactionService.selectedEndDate.set(today);
    }

    checkIfValidKey(e: KeyboardEvent) {
        return checkCurrencyInputKeyValid(
            e,
            Number(this.filterFields()[1].value)
        );
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

    clearAllFilters() {
        this.filterFields.update((prev) =>
            prev.map((filter) => ({ ...filter, value: '' }))
        );
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
            this.transactionService.selectedStartDate.set(start);
            this.transactionService.selectedEndDate.set(end);

            this.areDeletedTransactionsBeingViewed.set(false);
            this.areUntrackedTransactionsBeingViewed.set(false);
        }
    }

    toggleFilter() {
        this.isFilterOpen.set(!this.isFilterOpen());
    }

    toggleUntracked() {
        this.areDeletedTransactionsBeingViewed.set(false);
        this.areUntrackedTransactionsBeingViewed.update((prev) => !prev);
    }

    toggleDeleted() {
        this.transactionService.deletedTransactions.reload(); // need to figure out when this actually needs to happen later...

        this.areUntrackedTransactionsBeingViewed.set(false);
        this.areDeletedTransactionsBeingViewed.update((prev) => !prev);
    }
}
