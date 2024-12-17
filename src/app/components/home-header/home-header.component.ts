import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { BudgetService } from 'src/app/services/budget.service';
import { BBLogoComponent } from '../bb-logo/bb-logo.component';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'HomeHeader',
    templateUrl: './home-header.component.html',
    styleUrls: ['./home-header.component.scss'],
    imports: [
        BBLogoComponent,
        MatMenuTrigger,
        MatIcon,
        MatMenuModule,
        MatButtonModule
    ]
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
