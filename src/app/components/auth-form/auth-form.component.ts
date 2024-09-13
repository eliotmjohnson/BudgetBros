import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User, UserLoginResponse } from 'src/app/models/user';
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
    @Input() register = false;
    @Input() isRegistering = false;
    @Output() emitFlipCard = new EventEmitter();

    loginForm = this.formBuilder.group({
        username: ['', [Validators.email, Validators.required]],
        password: ['', Validators.required]
    });

    registerForm = this.formBuilder.group({
        firstName: ['', [Validators.required, Validators.pattern(/^\S*$/)]],
        lastName: ['', [Validators.required, Validators.pattern(/^\S*$/)]],
        email: ['', [Validators.email, Validators.required]],
        password: ['', [Validators.required, Validators.pattern(/^\S*$/)]]
    });

    isLoginError = signal(false);
    isRegisterError = signal(false);
    errorMessage = '';

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
            this.isRegisterError.set(false);
        } else {
            this.loginForm.reset();
            this.isLoginError.set(false);
        }

        this.emitFlipCard.emit();
    }

    loginOrRegister(e: SubmitEvent) {
        e.preventDefault();

        if (this.isRegistering) {
            this.isRegisterError.set(false);
            const newUser = this.registerForm.value;

            this.authService.register(newUser as User).subscribe({
                next: (createdUser) => {
                    this.authService
                        .login(createdUser.email, newUser.password!)
                        .subscribe({
                            next: (loginRes) => this.handleLogin(loginRes),
                            error: (error) => this.handleError(error)
                        });
                },
                error: (error) => {
                    this.handleError(error);
                }
            });
        } else {
            this.isLoginError.set(false);
            const loginCreds = this.loginForm.value;

            this.authService
                .login(loginCreds.username!, loginCreds.password!)
                .subscribe({
                    next: (loginRes) => this.handleLogin(loginRes),
                    error: (error) => this.handleError(error)
                });
        }
    }

    handleLogin(loginRes: UserLoginResponse) {
        this.authService.isLoggedIn = true;
        this.authService.isSubmitting = false;
        this.authService.loggedInUserName = loginRes.email;
        this.authService.userId = loginRes.id;
        this.authService.email = loginRes.email;

        this.authService.setLocalStorageData(
            loginRes.email,
            loginRes.id,
            loginRes.token
        );

        this.router.navigateByUrl('/home');
    }

    handleError(error: HttpErrorResponse) {
        this.authService.isSubmitting = false;
        if (this.isRegistering) {
            if (error.status === 409) {
                this.errorMessage =
                    'User already exists. Please try another email.';
            } else {
                this.errorMessage =
                    'Looks like our app is having issues. Please try again later.';
            }
            this.isRegisterError.set(true);
        } else {
            if (error.status === 401) {
                this.errorMessage =
                    'Email or password is incorrect. Please try again.';
            } else {
                this.errorMessage =
                    'Looks like our app is having issues. Please try again later.';
            }
            this.isLoginError.set(true);
        }
    }
}
