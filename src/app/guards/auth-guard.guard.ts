import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const token = localStorage.getItem('token');

    if (token) {
        if (!authService.isLoggedIn) {
            return authService.validateAuthToken(token);
        } else {
            return true;
        }
    } else {
        return router.parseUrl('/login');
    }
};
