import { HttpInterceptorFn } from '@angular/common/http';
import { unprotectedRoutes } from '../constants/constants';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
    const token = localStorage.getItem('token');

    const isUnprotectedRoute = unprotectedRoutes.some((route) =>
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
        // TODO: need to handle some sort of notification to the user as to why this occured
        return next(req);
    }
};
