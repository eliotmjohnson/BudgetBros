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
import { LineItemService } from 'src/app/services/line-item.service';
import { UpdateLineItemPayload } from 'src/app/models/lineItem';

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
    standalone: false
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
        public cdr: ChangeDetectorRef,
        private lineItemService: LineItemService
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

    updateLineItemName(newTitle: string) {
        const updateLineItemPayload: UpdateLineItemPayload = {
            id:
                this.transactionService.currentSelectedLineItem()?.lineItemId ??
                '',
            name: newTitle,
            plannedAmount:
                this.transactionService.currentSelectedLineItem()
                    ?.plannedAmount ?? 0
        };

        this.lineItemService.updateLineItem(updateLineItemPayload);
        const fetchedLineItem = this.lineItemService.fetchLineItem(
            this.transactionService.currentSelectedLineItem()?.lineItemId ?? ''
        );
        if (fetchedLineItem) {
            fetchedLineItem.plannedAmount = updateLineItemPayload.plannedAmount;
            fetchedLineItem.name = updateLineItemPayload.name;
        }
        this.transactionService.currentSelectedLineItem.update((lineItem) => ({
            ...lineItem!,
            name: updateLineItemPayload.name
        }));
    }
}
