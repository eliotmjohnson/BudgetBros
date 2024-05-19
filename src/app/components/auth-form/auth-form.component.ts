import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'AuthForm',
    templateUrl: './auth-form.component.html',
    styleUrls: ['./auth-form.component.scss'],
    host: {
        '[class.back]': 'register'
    }
})
export class AuthFormComponent {
    @Input() register: boolean = false;
    @Input() isRegistering: boolean = false;
    @Output() emitFlipCard = new EventEmitter();

    loginForm = this.formBuilder.group({
        username: ['', Validators.required],
        password: ['', Validators.required]
    });

    registerForm = this.formBuilder.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', Validators.required],
        password: ['', Validators.required]
    });

    get isRegisterForm() {
        return this.register
            ? this.isRegistering
                ? ''
                : 'hide-card'
            : !this.isRegistering
            ? ''
            : 'hide-card';
    }

    get isSubmitButtonDisabled() {
        return !this.authService.isSubmitting
            ? this.register
                ? !this.isRegistering || !this.registerForm.valid
                : this.isRegistering || !this.loginForm.valid
            : this.authService.isSubmitting;
    }

    constructor(
        private formBuilder: FormBuilder,
        public authService: AuthService,
        private router: Router
    ) {}

    flipCard() {
        if (this.isRegistering) {
            this.registerForm.reset();
        } else {
            this.loginForm.reset();
        }

        this.emitFlipCard.emit();
    }

    loginOrRegister(e: SubmitEvent) {
        e.preventDefault();

        if (this.isRegistering) {
            const newUser = this.registerForm.value;

            this.authService
                .register(newUser as User)
                .subscribe((createdUser) => {
                    this.authService
                        .login(createdUser.email, newUser.password!)
                        .subscribe((loginRes) => {
                            this.authService.isLoggedIn = true;
                            this.authService.isSubmitting = false;
                            this.authService.loggedInUserName = loginRes.email;
                            localStorage.setItem('token', loginRes.token);
                            this.router.navigateByUrl('/home');
                        });
                });
        } else {
            const loginCreds = this.loginForm.value;

            this.authService
                .login(loginCreds.username!, loginCreds.password!)
                .subscribe((loginRes) => {
                    this.authService.isLoggedIn = true;
                    this.authService.isSubmitting = false;
                    this.authService.loggedInUserName = loginRes.email;
                    localStorage.setItem('token', loginRes.token);
                    this.router.navigateByUrl('/home');
                });
        }
    }
}
