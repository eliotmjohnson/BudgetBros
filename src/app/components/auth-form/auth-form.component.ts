import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

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

    constructor(private formBuilder: FormBuilder) {}

    flipCard() {
        this.loginForm.reset();
        this.emitFlipCard.emit();
    }
}
