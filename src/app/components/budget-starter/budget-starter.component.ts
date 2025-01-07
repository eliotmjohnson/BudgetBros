import {
    Component,
    ElementRef,
    inject,
    OnInit,
    output,
    Renderer2,
    signal
} from '@angular/core';
import { BudgetService } from 'src/app/services/budget.service';
import { MobileModalService } from 'src/app/services/mobile-modal.service';

@Component({
    selector: 'BudgetStarter',
    standalone: false,
    templateUrl: './budget-starter.component.html',
    styleUrl: './budget-starter.component.scss',
    host: {
        '(touchstart)': 'this.startDismissalDrag($event)',
        '[style.transform]': 'this.translateY',
        '[style.transition]': 'this.modalTransition'
    }
})
export class BudgetStarterComponent implements OnInit {
    budgetService = inject(BudgetService);
    mobileService = inject(MobileModalService);
    optionEmitter = output<string>();
    isBudgetCopyAvailable = signal(false);
    translateY = '';
    modalTransition: string | undefined = undefined;

    constructor(
        private renderer: Renderer2,
        private host: ElementRef,
        private mobileModalService: MobileModalService
    ) {}

    ngOnInit(): void {
        this.determineBudgetCopyEligibility();
    }

    emitOption(option: string) {
        if (this.mobileService.isMobileDevice()) {
            this.mobileService.budgetCopyOption.set(option);
        } else {
            this.optionEmitter.emit(option);
        }
    }

    determineBudgetCopyEligibility() {
        const availableBudgets = this.budgetService.availableBudgets();
        const currentBudget = this.budgetService.budget();

        if (availableBudgets && currentBudget) {
            this.isBudgetCopyAvailable.set(
                availableBudgets.some((budget) => {
                    return (
                        (budget.year === currentBudget.year &&
                            budget.monthNumber ===
                                currentBudget.monthNumber - 1) ||
                        (budget.year === currentBudget.year - 1 &&
                            budget.monthNumber === 12)
                    );
                })
            );
        }
    }

    startDismissalDrag(e: TouchEvent) {
        const initialYPos = e.touches[0].clientY;
        this.modalTransition = 'transform 0.08s';

        const touchMoveListener = this.renderer.listen(
            this.host.nativeElement,
            'touchmove',
            (e: TouchEvent) => {
                const currentYPos = e.touches[0].clientY;
                const diff = currentYPos - initialYPos;
                this.mobileModalService.modalDismissalProgress.set(
                    diff < 0 ? diff / 6000 : diff / 650
                );
                this.translateY = `translateY(${diff < 0 ? diff * 0.03 : diff}px)`;
            }
        );
        const touchEndListener = this.renderer.listen(
            this.host.nativeElement,
            'touchend',
            (e: TouchEvent) => {
                this.modalTransition = undefined;
                const endYPos = e.changedTouches[0].clientY;

                if (endYPos - initialYPos < 200) {
                    setTimeout(() => (this.translateY = ''), 40); // iOS is crippled :(
                } else {
                    this.mobileModalService.isMobileBudgetStarterModalOpen.set(
                        false
                    );
                }

                this.mobileModalService.modalDismissalProgress.set(undefined);
                touchMoveListener();
                touchEndListener();
            }
        );
    }
}
