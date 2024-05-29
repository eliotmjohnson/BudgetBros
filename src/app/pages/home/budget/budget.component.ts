import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { budgetCategoryData } from 'src/app/mocks/budgetCategoryData';
import { BudgetCategory } from 'src/app/models/budget';

@Component({
    selector: 'app-budget',
    templateUrl: './budget.component.html',
    styleUrls: ['./budget.component.scss']
})
export class BudgetComponent {
    currentDate = new Date().toLocaleDateString();
    budgetCategories: BudgetCategory[] = budgetCategoryData;

    handleDrop(event: CdkDragDrop<BudgetCategory[]>) {
        moveItemInArray(
            this.budgetCategories,
            event.previousIndex,
            event.currentIndex
        );
    }
}
