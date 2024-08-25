import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { BudgetService } from 'src/app/services/budget.service';

@Component({
    selector: 'HomeHeader',
    templateUrl: './home-header.component.html',
    styleUrls: ['./home-header.component.scss']
})
export class HomeHeaderComponent {
    constructor(
        public authService: AuthService,
        private budgetService: BudgetService
    ) {}

    logout() {
        this.budgetService.clearBudget();
        this.authService.logout();
    }
}
