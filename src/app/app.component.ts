import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { loaderOverlayAnimation } from './animations/loader-overlay-animation';
import {
    addTransactionModalAnimation,
    budgetTransactionModalAnimation
} from './animations/mobile-modal-animations';
import { AuthService } from './services/auth.service';
import { MobileModalService } from './services/mobile-modal.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSpinner } from '@angular/material/progress-spinner';
import { BBLogoComponent } from './components/bb-logo/bb-logo.component';
import { TabsBarComponent } from './components/mobile-components/tabs-bar/tabs-bar.component';
import { AddTransactionMobileModalComponent } from './components/mobile-components/add-transaction-mobile-modal/add-transaction-mobile-modal.component';
import { BudgetTransactionsCardComponent } from './components/budget-transactions-card/budget-transactions-card.component';
import { BudgetStarterComponent } from './components/budget-starter/budget-starter.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    animations: [
        loaderOverlayAnimation,
        addTransactionModalAnimation,
        budgetTransactionModalAnimation
    ],
    host: {
        '[class.modal-present]': `(this.mobileModalService.isAddTransactionModalOpen()
            && !this.mobileModalService.isBudgetTransactionsModalOpen()) || mobileModalService.isMobileBudgetStarterModalOpen()`
    },
    imports: [
        BBLogoComponent,
        MatSpinner,
        RouterOutlet,
        TabsBarComponent,
        AddTransactionMobileModalComponent,
        BudgetTransactionsCardComponent,
        BudgetStarterComponent
    ]
})
export class AppComponent implements OnInit {
    animationEnd = false;

    constructor(
        public authService: AuthService,
        private layout: BreakpointObserver,
        private router: Router,
        public mobileModalService: MobileModalService,
        private dialogService: MatDialog
    ) {}

    ngOnInit(): void {
        this.layout
            .observe([
                '(max-width: 500px)',
                '(max-width: 1155px) and (min-width: 500px)'
            ])
            .subscribe((result) => {
                const states = Object.values(result.breakpoints);

                if (states[0]) {
                    this.mobileModalService.isMobileDevice.set(true);
                } else {
                    this.mobileModalService.isMobileDevice.set(false);
                }

                if (states[1]) {
                    this.closeAllModals();
                    this.router.navigateByUrl('/mobile');
                } else {
                    if (this.router.url === '/mobile') {
                        this.router.navigateByUrl('/');
                    }
                }
            });
    }

    closeAllModals() {
        this.dialogService.closeAll();
        this.mobileModalService.isAddTransactionModalOpen.set(false);
        this.mobileModalService.isBudgetTransactionsModalOpen.set(false);
    }
}
