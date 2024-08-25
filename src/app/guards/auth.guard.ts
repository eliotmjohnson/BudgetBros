import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = () => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const token = localStorage.getItem('token');

    if (token) {
        if (!authService.isLoggedIn) {
            return authService.refreshSession(token).pipe(
                map((res) => {
                    if (res) return true;

                    return router.parseUrl('/login');
                })
            );
        }

        return true;
    } else {
        return router.parseUrl('/login');
    }
};
