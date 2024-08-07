import { HttpInterceptorFn } from '@angular/common/http';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const unprotectedRoutes = ['login', 'session-refresh', 'register']

  const isUnprotectedRoute = unprotectedRoutes.some(route => req.url.includes(route));

  if (token && !isUnprotectedRoute) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(authReq);
  }

  return next(req);
};
