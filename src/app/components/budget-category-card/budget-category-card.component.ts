import { Component, Input } from '@angular/core';

@Component({
    selector: 'BudgetCategoryCard',
    templateUrl: './budget-category-card.component.html',
    styleUrls: ['./budget-category-card.component.scss']
})
export class BudgetCategoryCardComponent {
    @Input() budgetCategoryItems: any[] = [];
    @Input() name = '';
}
