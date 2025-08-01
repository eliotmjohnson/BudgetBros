import { Component } from '@angular/core';
import { cloneDeep, isEqual } from 'lodash';
import { deleteItemAnimation } from 'src/app/animations/mobile-item-animations';
import { Budget } from 'src/app/models/budget';
import { BudgetService } from 'src/app/services/budget.service';

@Component({
    selector: 'BudgetCalculator',
    templateUrl: './budget-calculator.component.html',
    styleUrl: './budget-calculator.component.scss',
    animations: [deleteItemAnimation],
    standalone: false
})
export class BudgetCalculatorComponent {
    previousBudget?: Budget;
    calculatedBudgetCache = 0;

    get calculatedBudgetAmount() {
        const currentBudget = this.budgetService.budget();
        if (currentBudget && !isEqual(this.previousBudget, currentBudget)) {
            this.previousBudget = cloneDeep(currentBudget);
            this.calculatedBudgetCache = this.calculateBudget(currentBudget);
            return this.calculatedBudgetCache;
        } else {
            return this.calculatedBudgetCache;
        }
    }

    constructor(private budgetService: BudgetService) {}

    calculateBudget(budget: Budget) {
        if (budget.budgetCategories.length === 0) {
            return 0;
        }
        const incomeAmount =
            (budget.paycheckAmount ?? 0) + (budget.additionalIncomeAmount ?? 0);
        const totalPlannedAmount = budget.budgetCategories.reduce(
            (categoryTotal, category) => {
                return (
                    categoryTotal +
                    category.lineItems.reduce((itemTotal, item) => {
                        return itemTotal + item.plannedAmount;
                    }, 0)
                );
            },
            0
        );

        return incomeAmount - totalPlannedAmount;
    }
}
