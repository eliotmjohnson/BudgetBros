import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'Sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    standalone: false
})
export class SidebarComponent implements OnInit {
    currentTab = 'Budget';
    tabs = [
        { description: 'Budget', iconName: 'savings' },
        { description: 'Transactions', iconName: 'paid' },
        { description: 'Goals', iconName: 'verified' },
        { description: 'Accounts', iconName: 'group' },
        { description: 'Settings', iconName: 'settings' }
    ];

    constructor(private router: Router) {}

    ngOnInit(): void {
        this.currentTab = this.router.url.split('/').at(-1) ?? '';
    }
}
