import { Component } from '@angular/core';
import { budgetCategoryData } from 'src/app/mocks/budgetCategoryData';

@Component({
    selector: 'app-budget',
    templateUrl: './budget.component.html',
    styleUrls: ['./budget.component.scss']
})
export class BudgetComponent {
    currentDate = new Date().toLocaleDateString();
    budgetCategories = budgetCategoryData;
}
