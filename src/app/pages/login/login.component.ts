import { Component } from '@angular/core';
import { AuthFormComponent } from 'src/app/components/auth-form/auth-form.component';

@Component({
    selector: 'Login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    imports: [AuthFormComponent]
})
export class LoginComponent {
    isRegistering = false;

    flipCard() {
        this.isRegistering = !this.isRegistering;
    }
}
