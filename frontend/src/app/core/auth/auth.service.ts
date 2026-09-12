import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthUser } from '../models/user.model';

/**
 * Session state holder.
 *
 * The SPA never sees a token: the backend completes the SAML handshake and sets an
 * httpOnly `tidalis_session` cookie, then redirects back to the frontend origin. All the
 * frontend can do is ask `GET /api/auth/me` who it is.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly _user = signal<AuthUser | null>(null);
  private readonly _resolved = signal(false);

  /** Currently signed-in user, or null when signed out. */
  readonly user = this._user.asReadonly();
  /** True once the initial `/api/auth/me` probe has completed (success or 401). */
  readonly resolved = this._resolved.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);

  readonly initials = computed(() => {
    const user = this._user();
    if (!user) {
      return '?';
    }
    const source = (user.name || user.email || '').trim();
    const parts = source.split(/[\s.@_-]+/).filter(Boolean);
    if (parts.length === 0) {
      return '?';
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });

  /**
   * Probes the session. Called once at bootstrap (see `provideAppInitializer` in
   * app.config.ts) and never rejects — a 401 simply means "signed out".
   */
  loadCurrentUser(): Observable<AuthUser | null> {
    return this.http.get<AuthUser>(`${environment.apiBaseUrl}/api/auth/me`).pipe(
      tap((user) => {
        this._user.set(user ?? null);
        this._resolved.set(true);
      }),
      catchError(() => {
        this._user.set(null);
        this._resolved.set(true);
        return of(null);
      }),
    );
  }

  /**
   * Server-initiated SAML login. This must be a full page navigation, not an
   * XHR/`Router` navigation: the browser has to follow the 302 chain to the IdP and back.
   */
  loginWithSso(): void {
    window.location.href = `${environment.apiBaseUrl}/api/auth/saml/login`;
  }

  logout(): Observable<unknown> {
    return this.http.post(`${environment.apiBaseUrl}/api/auth/logout`, {}).pipe(
      catchError(() => of(null)),
      tap(() => this._user.set(null)),
    );
  }

  /** Called by the 401 interceptor. */
  clearSession(): void {
    this._user.set(null);
  }
}
