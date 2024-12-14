import { CurrencyPipe } from '@angular/common';
import {
    AfterViewChecked,
    Component,
    effect,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { UpdateFundPayload } from 'src/app/models/lineItem';
import { LineItemService } from 'src/app/services/line-item.service';
import { MobileModalService } from 'src/app/services/mobile-modal.service';
import { TransactionService } from 'src/app/services/transaction.service';
import {
    addValueToCurrencyInput,
    stripCurrency
} from 'src/app/utils/currencyUtils';

@Component({
    selector: 'InlineFeature',
    templateUrl: './inline-feature.component.html',
    styleUrl: './inline-feature.component.scss',
    host: {
        '[class.panel-expanded]': 'isPanelExpanded && !isFund',
        '[class.is-creating-fund]':
            'isPanelExpanded && (isCreatingFund || isFund)'
    },
    providers: [CurrencyPipe]
})
export class InlineFeatureComponent implements OnInit, AfterViewChecked {
    @ViewChild('formInput') formInput?: ElementRef<HTMLInputElement>;
    @Input() isCreatingFund = false;
    @Input() isDetailsComponent = false;
    @Input() isFund: boolean | undefined = false;
    @Output() closeMobileModal = new EventEmitter();

    formLoaded = false;
    isPanelExpanded = false;
    featureForm = new FormControl(
        this.currencyPipe.transform(
            this.transactionService
                .currentSelectedLineItem()
                ?.startingBalance?.toString() || '0.00'
        )
    );

    constructor(
        public mobileService: MobileModalService,
        private currencyPipe: CurrencyPipe,
        private lineItemService: LineItemService,
        public transactionService: TransactionService
    ) {
        effect(() => {
            const startingBalance =
                this.transactionService.currentSelectedLineItem()
                    ?.startingBalance;

            if (startingBalance != undefined) {
                this.featureForm.setValue(
                    this.currencyPipe.transform(startingBalance.toString())
                );
            }
        });
    }

    ngOnInit(): void {
        this.isPanelExpanded = this.isDetailsComponent;
    }

    ngAfterViewChecked(): void {
        if (this.formInput && !this.formLoaded) {
            if (this.mobileService.isMobileDevice()) {
                this.formInput.nativeElement.setAttribute('pattern', '\\d*');
            }
            this.featureForm.clearValidators();
            this.featureForm.updateValueAndValidity();
            this.formLoaded = true;
        }
    }

    handleInput(e: Event) {
        this.featureForm.setValue(
            this.currencyPipe.transform(addValueToCurrencyInput(e))
        );
    }

    handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        const lineItemId =
            this.transactionService.currentSelectedLineItem()?.lineItemId;
        if (lineItemId) {
            const updateFundPayload: UpdateFundPayload = {
                startingBalance: stripCurrency(
                    undefined,
                    undefined,
                    this.featureForm.value!
                ),
                isAddingFund: !this.isFund
            };

            this.lineItemService.updateFund(
                this.transactionService.currentSelectedLineItem()!.lineItemId,
                updateFundPayload
            );

            this.eagerUpdateLineItem(lineItemId, updateFundPayload);
        }
    }

    eagerUpdateLineItem(
        lineItemId: string,
        updateFundPayload: UpdateFundPayload
    ) {
        const fetchedLineItem = this.lineItemService.fetchLineItem(lineItemId);
        if (fetchedLineItem) {
            fetchedLineItem.startingBalance = updateFundPayload.startingBalance;
            fetchedLineItem.isFund = true;
        }

        this.expandFeaturePanel();
        this.closeMobileModal.emit();
        this.featureForm.markAsPristine();
        this.featureForm.markAsUntouched();
    }

    expandFeaturePanel() {
        if (!this.mobileService.isMobileDevice()) {
            this.isPanelExpanded = !this.isPanelExpanded;
        }
    }

    changeToCreatingMode() {
        this.isCreatingFund = true;
    }
}
