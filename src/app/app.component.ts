import { Component } from '@angular/core';
import { loaderOverlayAnimation } from './animations/loader-overlay-animation';
import { AuthService } from './services/auth.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    animations: [loaderOverlayAnimation]
})
export class AppComponent {
    constructor(public authService: AuthService) {}
}
