import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Shape attached to `request.user` by JwtCookieAuthGuard. */
export interface SessionUser {
  id: number;
  email: string;
  name?: string | null;
}

/**
 * Injects the authenticated user, e.g. `@CurrentUser() user: SessionUser`.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SessionUser => ctx.switchToHttp().getRequest().user,
);
