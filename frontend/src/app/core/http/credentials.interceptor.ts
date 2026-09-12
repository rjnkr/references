import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Angular's HttpClient does not attach cookies to cross-origin requests unless
 * `withCredentials` is set. The session lives in an httpOnly cookie, so every outgoing
 * request needs it — set it globally here rather than at each call site.
 */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) =>
  next(req.clone({ withCredentials: true }));
