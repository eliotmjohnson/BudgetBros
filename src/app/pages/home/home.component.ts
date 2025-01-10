import { Component, computed } from '@angular/core';
import { ChildrenOutletContexts } from '@angular/router';
import { dimmerAnimation } from 'src/app/animations/mobile-modal-animations';
import { routerAnimations } from 'src/app/animations/router-animations';
import { MobileModalService } from 'src/app/services/mobile-modal.service';

@Component({
    selector: 'Home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    animations: [routerAnimations, dimmerAnimation],
    host: {
        '[class.modal-present]': `(this.mobileModalService.isAddTransactionModalOpen()
            && !this.mobileModalService.isBudgetTransactionsModalOpen()) || this.mobileModalService.isMobileBudgetStarterModalOpen()`,
        '[class.slide-body]':
            'this.mobileModalService.isBudgetTransactionsModalOpen()',
        '[style.transform]': 'scaleCalc()',
        '[style.borderRadius.rem]': 'radiusCalc()',
        '[style.transition]':
            "this.mobileModalService.modalDismissalProgress() ? '0s' : undefined"
    },
    standalone: false
})
export class HomeComponent {
    constructor(
        private outletContext: ChildrenOutletContexts,
        public mobileModalService: MobileModalService
    ) {}

    scaleCalc = computed(() =>
        this.mobileModalService.modalDismissalProgress()
            ? `scale(${0.9 + 0.1 * this.mobileModalService.modalDismissalProgress()!})
             translateY(calc(${
                 this.mobileModalService.isStandalone()
                     ? `${-1.25 + 1.25 * this.mobileModalService.modalDismissalProgress()!}rem 
                     + min(${3.5 - 3.5 * this.mobileModalService.modalDismissalProgress()!}vh, env(safe-area-inset-top))`
                     : `-1.25rem + ${1.25 * this.mobileModalService.modalDismissalProgress()!}rem`
             }`
            : undefined
    );

    radiusCalc = computed(() =>
        this.mobileModalService.modalDismissalProgress()
            ? 0.5 +
              (this.mobileModalService.isStandalone() ? 2.85 : -0.5) *
                  this.mobileModalService.modalDismissalProgress()!
            : undefined
    );

    opacityCalc = computed(() =>
        this.mobileModalService.modalDismissalProgress()
            ? 0.15 - 0.15 * this.mobileModalService.modalDismissalProgress()!
            : undefined
    );

    get routeData() {
        return this.outletContext.getContext('primary')?.route?.snapshot
            ?.data?.['routeName'];
    }
}
