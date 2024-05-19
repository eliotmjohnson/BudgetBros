import { Component, Input } from '@angular/core';
import { BudgetItem } from 'src/app/models/budget';

@Component({
    selector: 'BudgetCategoryCard',
    templateUrl: './budget-category-card.component.html',
    styleUrls: ['./budget-category-card.component.scss']
})
export class BudgetCategoryCardComponent {
    @Input() budgetCategoryItems: BudgetItem[] = [];
    @Input() name = '';
}
