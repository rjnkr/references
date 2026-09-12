import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../auth/auth.service';

/** The session probe is allowed to 401 — that is how "signed out" is reported. */
const SILENT_401_PATHS = ['/api/auth/me'];

/**
 * Sends the user to `/login` when the session expires mid-session. Deliberately skips
 * `/api/auth/me` so the bootstrap probe cannot cause a redirect loop.
 */
export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: unknown) => {
      const isUnauthorized = error instanceof HttpErrorResponse && error.status === 401;
      const isSilent = SILENT_401_PATHS.some((path) => req.url.includes(path));

      if (isUnauthorized && !isSilent) {
        auth.clearSession();
        if (!router.url.startsWith('/login')) {
          void router.navigate(['/login'], {
            queryParams: router.url && router.url !== '/' ? { returnUrl: router.url } : undefined,
          });
        }
      }

      return throwError(() => error);
    }),
  );
};
