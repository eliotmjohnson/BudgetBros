import { Component, Input } from '@angular/core';

@Component({
    selector: 'BudgetCategoryItem',
    templateUrl: './budget-category-item.component.html',
    styleUrls: ['./budget-category-item.component.scss']
})
export class BudgetCategoryItemComponent {
    @Input() itemTitle = '';
    @Input() plannedAmount = 0;
    @Input() fund = false;
    progressPercentage = 30;

    get remainingAmount() {
        return 20000 - this.plannedAmount;
    }
}
