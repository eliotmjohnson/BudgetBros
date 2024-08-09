import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { unprotectedRoutes } from '../constants/constants';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  const isUnprotectedRoute = unprotectedRoutes.some(route => req.url.includes(route));

  if (token && !isUnprotectedRoute) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(authReq);
  } else{
    // TODO: need to handle some sort of notification to the user as to why this occured
    router.navigate(['/login']);
  }

  return next(req);
};
