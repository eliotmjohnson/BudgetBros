import { Component } from '@angular/core';

@Component({
    selector: 'app-budget',
    templateUrl: './budget.component.html',
    styleUrls: ['./budget.component.scss']
})
export class BudgetComponent {
    currentDate = new Date().toLocaleDateString();
}
