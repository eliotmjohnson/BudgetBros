import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { loaderOverlayAnimation } from './animations/loader-overlay-animation';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    animations: [loaderOverlayAnimation]
})
export class AppComponent {
    constructor(public authService: AuthService) {}
}
