import { Component } from '@angular/core';
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
            'this.mobileModalService.isBudgetTransactionsModalOpen()'
    },
    standalone: false
})
export class HomeComponent {
    constructor(
        private outletContext: ChildrenOutletContexts,
        public mobileModalService: MobileModalService
    ) {}

    get routeData() {
        return this.outletContext.getContext('primary')?.route?.snapshot
            ?.data?.['routeName'];
    }
}
