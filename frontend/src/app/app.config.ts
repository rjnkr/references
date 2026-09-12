import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { authErrorInterceptor } from './core/http/auth-error.interceptor';
import { credentialsInterceptor } from './core/http/credentials.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
    ),
    provideHttpClient(withInterceptors([credentialsInterceptor, authErrorInterceptor])),
    provideAnimationsAsync(),
    provideNativeDateAdapter(),
    // en-GB gives dd/mm/yyyy, which is what the business uses.
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },
    // Resolve the session before the first route activates, so `authGuard` can decide
    // synchronously and a signed-in user never flashes the login screen.
    provideAppInitializer(() => inject(AuthService).loadCurrentUser()),
  ],
};
