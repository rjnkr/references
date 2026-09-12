import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a controller or route handler as reachable without a session cookie.
 * The globally registered JwtCookieAuthGuard skips anything annotated with it.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
