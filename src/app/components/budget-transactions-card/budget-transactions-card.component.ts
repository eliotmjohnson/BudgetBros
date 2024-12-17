import {
    ChangeDetectorRef,
    Component,
    computed,
    Input,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { deleteTransactionAnimation } from 'src/app/animations/mobile-item-animations';
import {
    dimmerAnimation,
    featureModalAnimation
} from 'src/app/animations/mobile-modal-animations';
import { Features } from 'src/app/constants/constants';
import { MobileModalService } from 'src/app/services/mobile-modal.service';
import { TransactionService } from 'src/app/services/transaction.service';
import {
    TransactionModalComponent,
    TransactionModalData
} from '../transaction-modal/transaction-modal.component';
import { CardComponent } from '../card/card.component';
import { MatIcon } from '@angular/material/icon';
import { InlineFeatureComponent } from '../inline-feature/inline-feature.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BBLogoComponent } from '../bb-logo/bb-logo.component';
import { InlineTransactionComponent } from '../inline-transaction/inline-transaction.component';
import { FeatureModalComponent } from '../mobile-components/feature-modal/feature-modal.component';
import { DecimalPipe } from '@angular/common';
import { SortByDatePipe } from 'src/app/pipes/sort-by-date.pipe';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'BudgetTransactionsCard',
    templateUrl: './budget-transactions-card.component.html',
    styleUrl: './budget-transactions-card.component.scss',
    animations: [
        deleteTransactionAnimation,
        featureModalAnimation,
        dimmerAnimation
    ],
    host: {
        '[class.open-budget-transactions-modal]': 'isMobileComponent',
        '[class.feature-modal-open]': 'isFeatureModalOpen'
    },
    imports: [
        CardComponent,
        MatIcon,
        InlineFeatureComponent,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        BBLogoComponent,
        InlineTransactionComponent,
        FeatureModalComponent,
        DecimalPipe,
        SortByDatePipe
    ]
})
export class BudgetTransactionsCardComponent {
    @Input() isMobileComponent = false;
    @ViewChild('featureModal', { read: ViewContainerRef })
    featureModal!: ViewContainerRef;
    isFeatureModalOpen = false;
    featureComponent = Features.FUND;
    features = Features;

    progress = computed(() => {
        return (
            (this.transactionService.currentSelectedLineItem()!
                .remainingAmount /
                (this.transactionService.currentSelectedLineItem()!
                    .plannedAmount || 0.01)) *
                100 || 0
        );
    });

    getProgressStyle = computed(() => {
        return this.progress() < 0
            ? '#e55b66'
            : this.progress()
              ? `conic-gradient(
                    rgb(109, 206, 109) ${this.progress()}%,
                    rgb(223, 223, 223) 0%
                )`
              : 'rgb(223, 223, 223)';
    });

    constructor(
        public transactionService: TransactionService,
        public mobileModalService: MobileModalService,
        private dialogService: MatDialog,
        public cdr: ChangeDetectorRef
    ) {}

    closeBudgetTransactionsModal() {
        this.transactionService.clearSelectedTransactionData();
        this.mobileModalService.isBudgetTransactionsModalOpen.set(false);
    }

    openAddTransactionModal() {
        this.dialogService.open<
            TransactionModalComponent,
            TransactionModalData
        >(TransactionModalComponent, {
            data: {
                mode: 'budgetTransactionsAdd',
                lineItemId:
                    this.transactionService.currentSelectedLineItem()
                        ?.lineItemId
            }
        });
    }

    openFeatureModal() {
        if (this.mobileModalService.isMobileDevice()) {
            this.isFeatureModalOpen = true;
            this.mobileModalService.isFeatureModalOpen.set(true);
        }
    }

    closeFeatureModal() {
        this.isFeatureModalOpen = false;
        this.mobileModalService.isFeatureModalOpen.set(false);
    }

    updateViewAnimation() {
        this.cdr.detectChanges();
    }
}
