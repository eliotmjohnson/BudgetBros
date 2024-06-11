import { Component } from '@angular/core';
import { ChildrenOutletContexts } from '@angular/router';
import { routerAnimations } from 'src/app/animations/router-animations';

@Component({
    selector: 'Home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    animations: [routerAnimations]
})
export class HomeComponent {
    constructor(private outletContext: ChildrenOutletContexts) {}

    get routeData() {
        return this.outletContext.getContext('primary')?.route?.snapshot
            ?.data?.['routeName'];
    }
}
