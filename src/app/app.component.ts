import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { loaderOverlayAnimation } from './animations/loader-overlay-animation';
import {
    addTransactionModalAnimation,
    budgetTransactionModalAnimation
} from './animations/mobile-modal-animations';
import { AuthService } from './services/auth.service';
import { MobileModalService } from './services/mobile-modal.service';
import { MatDialog } from '@angular/material/dialog';

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
    standalone: false
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
                '(max-width: 1155px) and (min-width: 500px)',
                '(max-width: 1340px) and (min-width: 1155px)'
            ])
            .subscribe((result) => {
                const states = Object.values(result.breakpoints);

                this.mobileModalService.isMobileDevice.set(!!states[0]);
                this.mobileModalService.isMidsizeDevice.set(!!states[2]);

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
