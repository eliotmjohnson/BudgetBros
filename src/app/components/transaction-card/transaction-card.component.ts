import { Component, computed, inject, input, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IsolatedTransaction, Transaction } from 'src/app/models/transaction';
import { TransactionService } from 'src/app/services/transaction.service';
import {
    TransactionModalComponent,
    TransactionModalData
} from '../transaction-modal/transaction-modal.component';
import { BudgetCategoryService } from 'src/app/services/budget-category.service';
import { getMonth, getYear } from 'src/app/utils/timeUtils';

@Component({
    selector: 'TransactionCard',
    templateUrl: './transaction-card.component.html',
    styleUrl: './transaction-card.component.scss'
})
export class TransactionCardComponent {
    transactionService = inject(TransactionService);
    dialog = inject(MatDialog);
    budgetCategoryService = inject(BudgetCategoryService);

    transaction = input.required<IsolatedTransaction | Transaction>();
    areNotesOpen = signal(false);

    budgetCategoryName = computed(() => {
        const transaction = this.transaction();

        if ('budgetCategoryName' in transaction) {
            return transaction.budgetCategoryName;
        }

        return null;
    });

    toggleNotes() {
        this.areNotesOpen.set(!this.areNotesOpen());
    }

    deleteTransaction(transactionId: IsolatedTransaction['transactionId']) {
        this.transactionService.softDeleteTransaction(transactionId);
    }

    openEditModal() {
        const month = getMonth(this.transaction().date);
        const year = getYear(this.transaction().date);

        this.budgetCategoryService.getBudgetCategoriesWithLineItems(
            month,
            year
        );

        const dialogRef = this.dialog.open<
            TransactionModalComponent,
            TransactionModalData
        >(TransactionModalComponent, {
            data: {
                mode: 'edit',
                transaction: this.transaction()
            }
        });

        dialogRef
            .afterClosed()
            .subscribe((result?: Transaction['transactionId']) => {
                if (result) {
                    this.transactionService.untrackedTransactions.reload();
                }
            });
    }
}
