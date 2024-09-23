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

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    animations: [
        loaderOverlayAnimation,
        addTransactionModalAnimation,
        budgetTransactionModalAnimation
    ]
})
export class AppComponent implements OnInit {
    constructor(
        public authService: AuthService,
        private layout: BreakpointObserver,
        private router: Router,
        public mobileModalService: MobileModalService
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
                    this.router.navigateByUrl('/mobile');
                } else {
                    this.router.navigateByUrl('/');
                }
            });
    }
}
