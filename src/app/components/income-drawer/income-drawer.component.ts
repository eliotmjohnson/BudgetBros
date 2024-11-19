import { CurrencyPipe } from '@angular/common';
import {
    AfterViewInit,
    Component,
    effect,
    ElementRef,
    Renderer2
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UpdateBudgetIncomePayload } from 'src/app/models/budget';
import { BudgetService } from 'src/app/services/budget.service';
import { MobileModalService } from 'src/app/services/mobile-modal.service';
import {
    addValueToCurrencyInput,
    currencyRequiredValidator,
    stripCurrency
} from 'src/app/utils/currencyUtils';

@Component({
    selector: 'IncomeDrawer',
    templateUrl: './income-drawer.component.html',
    styleUrl: './income-drawer.component.scss',
    host: {
        '[class.drawer-open]': 'isDrawerOpen',
        '[style.translate]': 'slideTranslate',
        '[style.transition]': 'slideTransition',
        '[class.is-sliding]': 'isSliding'
    },
    providers: [CurrencyPipe],
    standalone: false
})
export class IncomeDrawerComponent implements AfterViewInit {
    isDrawerOpen = false;
    form = this.formBuilder.group({
        paycheck: [this.currencyPipe.transform(0)],
        additionalIncome: [this.currencyPipe.transform(0)]
    });

    closeListener!: () => void;
    touchmoveListener: (() => void) | null = null;
    touchendListener: (() => void) | null = null;
    slideTranslate: string | null = null;
    slideTransition: string | null = null;
    isSliding = false;

    constructor(
        private formBuilder: FormBuilder,
        private currencyPipe: CurrencyPipe,
        private renderer: Renderer2,
        private elementRef: ElementRef<HTMLElement>,
        public mobileService: MobileModalService,
        public budgetService: BudgetService
    ) {
        effect(() => {
            this.setBudgetInputValues();
        });
    }

    ngAfterViewInit(): void {
        const controls = [
            this.form.controls.paycheck,
            this.form.controls.additionalIncome
        ];

        controls.forEach((control, i) => {
            control.clearValidators();
            if (i === 0) control.setValidators(currencyRequiredValidator);
            control.updateValueAndValidity();
        });
    }

    openDrawer() {
        this.slideTranslate = null;
        if (!this.isDrawerOpen) {
            this.form.markAsPristine();
            this.closeListener = this.renderer.listen(
                'document',
                'mousedown',
                (e) => {
                    if (
                        !this.elementRef.nativeElement.contains(
                            e.target as HTMLElement
                        )
                    ) {
                        this.slideTransition = null;
                        this.isDrawerOpen = false;
                        this.closeListener();
                    }
                }
            );
        } else {
            this.closeListener();
            this.setBudgetInputValues();
        }

        this.isDrawerOpen = !this.isDrawerOpen;
    }

    handleCurrencyInput(e: Event, field: string) {
        addValueToCurrencyInput(e, this.form, field);
        const fieldControl = this.form.get(field);
        if (fieldControl) {
            fieldControl.setValue(
                this.currencyPipe.transform(fieldControl.value.toString())
            );
        }
    }

    handleIncomeFormSubmit(e: SubmitEvent) {
        e.preventDefault();

        const incomeUpdatePayload = {
            paycheckAmount: stripCurrency('paycheck', this.form),
            additionalIncomeAmount: stripCurrency('additionalIncome', this.form)
        };

        this.budgetService.updateBudgetIncome(incomeUpdatePayload);
        this.updateBudgetIncomeState(incomeUpdatePayload);
        this.isDrawerOpen = false;
        this.closeListener();
    }

    updateBudgetIncomeState(payload: UpdateBudgetIncomePayload) {
        const currentBudget = this.budgetService.budget();
        if (currentBudget) {
            currentBudget.paycheckAmount = payload.paycheckAmount;
            currentBudget.additionalIncomeAmount =
                payload.additionalIncomeAmount;
        }
    }

    setBudgetInputValues() {
        const currentBudget = this.budgetService.budget();
        this.form.patchValue({
            paycheck: this.currencyPipe.transform(
                currentBudget?.paycheckAmount ?? 0
            ),
            additionalIncome: this.currencyPipe.transform(
                currentBudget?.additionalIncomeAmount ?? 0
            )
        });
    }

    setUpDrawerSlide(e: TouchEvent) {
        e.preventDefault();

        const startingYPos = e.touches[0].clientY;
        const hostHeight = this.elementRef.nativeElement.clientHeight;
        this.slideTransition = null;

        document.querySelectorAll('input').forEach((input) => {
            input.blur();
        });

        if (!this.touchmoveListener) {
            this.touchmoveListener = this.renderer.listen(
                'document',
                'touchmove',
                (event: TouchEvent) => {
                    this.isSliding = true;
                    const currentYPos = event.touches[0].clientY;
                    const diffY = currentYPos - startingYPos;
                    const translateY = this.calculateTranslateY(
                        diffY,
                        hostHeight
                    );

                    this.slideTranslate = `0 calc(${
                        this.isDrawerOpen ? '7rem' : '-14rem'
                    } + ${translateY}px)`;
                }
            );
        }

        if (!this.touchendListener) {
            this.touchendListener = this.renderer.listen(
                'document',
                'touchend',
                () => {
                    if (this.isSliding) {
                        this.slideTransition = `translate .25s`;
                        this.isSliding = false;
                    }

                    this.cleanUpListeners();
                    this.openDrawer();
                }
            );
        }
    }

    calculateTranslateY(diffY: number, hostHeight: number): number {
        if (this.isDrawerOpen) {
            if (diffY <= 0 && diffY >= -hostHeight) {
                return diffY;
            } else if (diffY >= 0) {
                return 0;
            } else {
                return -hostHeight;
            }
        } else {
            if (diffY >= 0 && diffY <= hostHeight) {
                return diffY;
            } else if (diffY <= 0) {
                return 0;
            } else {
                return hostHeight;
            }
        }
    }

    cleanUpListeners() {
        this.touchendListener?.();
        this.touchmoveListener?.();
        this.touchendListener = null;
        this.touchmoveListener = null;
    }

    selectInputText(input: HTMLInputElement) {
        if (this.mobileService.isIOSDevice()) {
            setTimeout(() => input?.select(), 50);
        } else {
            input?.select();
        }
    }
}
