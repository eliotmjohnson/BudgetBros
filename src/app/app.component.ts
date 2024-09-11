import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { loaderOverlayAnimation } from './animations/loader-overlay-animation';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    animations: [loaderOverlayAnimation]
})
export class AppComponent implements OnInit {
    isSmallScreen = false;

    constructor(
        public authService: AuthService,
        private layout: BreakpointObserver,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.layout.observe('(max-width: 1155px)').subscribe((result) => {
            if (result.matches) {
                this.router.navigateByUrl('/mobile');
            } else {
                this.router.navigateByUrl('/');
            }
        });
    }
}
