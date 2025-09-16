import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  //  Get token from localStorage
  const token = localStorage.getItem('token');

  //  Clone request and set Authorization header if token exists
  const authReq = token
    ? req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('role');

        // Redirect to login
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};

