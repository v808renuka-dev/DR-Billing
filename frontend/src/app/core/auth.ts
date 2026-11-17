import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ApiService } from './api.service';

export const authGuard: CanActivateFn = () => {
  const api = inject(ApiService);
  return api.token() ? true : inject(Router).createUrlTree(['/login']);
};

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const api = inject(ApiService);
  const t = api.token();
  if (t) req = req.clone({ setHeaders: { Authorization: `Bearer ${t}` } });
  return next(req).pipe(catchError(err => {
    if (err.status === 401 && !req.url.includes('/auth/login')) api.logout();
    return throwError(() => err);
  }));
};

export const errMsg = (e: any) => e?.error?.message || 'Something went wrong. Is the server running?';
