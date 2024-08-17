import { HttpInterceptorFn } from '@angular/common/http';
import { UNPROTECTED_ROUTES } from '../constants/constants';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
    const token = localStorage.getItem('token');

    const isUnprotectedRoute = UNPROTECTED_ROUTES.some((route) =>
        req.url.includes(route)
    );

    if (token && !isUnprotectedRoute) {
        const authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });

        return next(authReq);
    } else {
        return next(req);
    }
};
