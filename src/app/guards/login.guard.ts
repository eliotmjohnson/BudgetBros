import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const loginGuard: CanActivateFn = () => {
    const router = inject(Router);
    const token = localStorage.getItem('token');

    return token ? router.parseUrl('/home') : true;
};
