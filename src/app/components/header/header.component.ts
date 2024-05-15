import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'CustomHeader',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
    constructor(private authService: AuthService) {}

    logout() {
        this.authService.logout();
    }
}
