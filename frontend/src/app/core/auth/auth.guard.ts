import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

/**
 * Guards every route except `/login`. By the time this runs the app initializer has
 * already resolved `GET /api/auth/me`, so the check is synchronous.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: state.url && state.url !== '/' ? { returnUrl: state.url } : undefined,
  });
};

/**
 * Keeps authenticated users off `/login`. Sends them to the start screen (`/`) rather
 * than straight to the list, so both entry points — the reference table and the world
 * map — are one click away after signing in.
 */
export const loginPageGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAuthenticated() ? router.createUrlTree(['/']) : true;
};
