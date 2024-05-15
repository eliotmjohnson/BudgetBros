import { Component } from '@angular/core';

@Component({
    selector: 'Sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
    tabs = [
        { description: 'Budget', iconName: 'savings' },
        { description: 'Transactions', iconName: 'paid' },
        { description: 'Goals', iconName: 'verified' },
        { description: 'Accounts', iconName: 'group' },
        { description: 'Settings', iconName: 'settings' }
    ];
}