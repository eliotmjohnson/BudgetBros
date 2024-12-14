import { Component, inject, OnInit, output, signal } from '@angular/core';
import { BudgetService } from 'src/app/services/budget.service';
import { MobileModalService } from 'src/app/services/mobile-modal.service';

@Component({
    selector: 'BudgetStarter',
    templateUrl: './budget-starter.component.html',
    styleUrl: './budget-starter.component.scss'
})
export class BudgetStarterComponent implements OnInit {
    budgetService = inject(BudgetService);
    mobileService = inject(MobileModalService);
    optionEmitter = output<string>();
    isBudgetCopyAvailable = signal(false);

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
}
