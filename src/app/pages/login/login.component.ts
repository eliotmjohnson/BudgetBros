import { Component } from '@angular/core';

@Component({
    selector: 'Login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    isRegistering = false;

    flipCard() {
        this.isRegistering = !this.isRegistering;
    }
}
