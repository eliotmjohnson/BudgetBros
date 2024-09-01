import { Component, inject, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IsolatedTransaction } from 'src/app/models/transaction';
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

    transaction = input.required<IsolatedTransaction>();

    deleteTransaction(transactionId: IsolatedTransaction['id']) {
        this.transactionService.softDeleteTransaction(transactionId);
    }

    openEditModal() {
        const month = getMonth(this.transaction().date);
        const year = getYear(this.transaction().date);

        this.budgetCategoryService.getBudgetCategoriesWithLineItems(
            month,
            year
        );

        this.dialog.open<TransactionModalComponent, TransactionModalData>(
            TransactionModalComponent,
            {
                data: {
                    mode: 'edit',
                    transaction: this.transaction()
                }
            }
        );
    }
}
