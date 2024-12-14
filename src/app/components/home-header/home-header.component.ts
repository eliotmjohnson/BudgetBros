import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { BudgetService } from 'src/app/services/budget.service';
import { BBLogoComponent } from '../bb-logo/bb-logo.component';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'HomeHeader',
    templateUrl: './home-header.component.html',
    styleUrls: ['./home-header.component.scss'],
    imports: [BBLogoComponent, MatMenuTrigger, MatIcon, MatMenu]
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
