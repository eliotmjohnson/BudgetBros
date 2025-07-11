import {
    Component,
    Host,
    input,
    OnInit,
    Optional,
    output
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ModalDismissDirective } from 'src/app/directives/modal-dismiss.directive';
import { BudgetCategoryWithLineItems } from 'src/app/models/budgetCategory';
import { LineItemReduced } from 'src/app/models/lineItem';
import { MobileModalService } from 'src/app/services/mobile-modal.service';

@Component({
    selector: 'LineItemSelectorModal',
    standalone: false,
    templateUrl: './line-item-selector-modal.component.html',
    styleUrl: './line-item-selector-modal.component.scss',
    host: {
        '(onModalDismiss)': 'closeModal(true)',
        '[class.full-screen]':
            'mobileModalService.isBudgetTransactionsModalOpen()'
    }
})
export class LineItemSelectorModalComponent implements OnInit {
    lineItems = input<FormControl<LineItemReduced[] | null>>();
    budgetCategoryData = input<BudgetCategoryWithLineItems[]>();
    initialLineItemsSelected: LineItemReduced[] = [];
    onModalClose = output();

    constructor(
        @Host() @Optional() private modalDismiss: ModalDismissDirective,
        private mobileModalService: MobileModalService
    ) {}

    ngOnInit(): void {
        this.initialLineItemsSelected = this.lineItems()!.value!;
    }

    updateSelectedLineItems(lineItem: LineItemReduced) {
        const initialLineItems = this.lineItems()!.value;

        if (this.isLineItemSelected(lineItem)) {
            this.lineItems()!.setValue(
                initialLineItems!.filter(
                    (selectedLineItem) =>
                        selectedLineItem.lineItemId !== lineItem.lineItemId
                )
            );
        } else {
            this.lineItems()!.setValue([...initialLineItems!, lineItem]);
        }
    }

    isLineItemSelected(lineItem: LineItemReduced) {
        if (this.lineItems()?.value && this.lineItems()!.value!.length > 0) {
            return this.lineItems()!.value!.some(
                (selectedLineItem) =>
                    selectedLineItem.lineItemId === lineItem.lineItemId
            );
        }
        return false;
    }

    closeModal(isCancel = false) {
        if (isCancel) {
            this.lineItems()!.setValue(this.initialLineItemsSelected);
        } else {
            this.lineItems()?.markAsDirty();
        }

        this.onModalClose.emit();
    }

    handleScrollDismiss(e: Event) {
        this.modalDismiss.canDismiss.set(
            (e.target as HTMLElement).scrollTop === 0
        );
    }
}
