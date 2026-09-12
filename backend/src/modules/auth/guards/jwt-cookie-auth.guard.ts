import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../../core/decorators/public.decorator';
import { AuthService } from '../auth.service';

/**
 * Registered as a global APP_GUARD, so every route is protected by default.
 * Routes that must be reachable without a session (the SSO handshake, /me,
 * /logout, the MCP endpoint which uses its own API key) opt out with @Public().
 *
 * Reads the `tidalis_session` httpOnly cookie, verifies the JWT and attaches
 * `{ id, email }` to the request as `request.user`.
 */
@Injectable()
export class JwtCookieAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    // Local development without a real IdP: inject a stand-in user rather than
    // rejecting everything. Guarded by AUTH_DISABLED, never enable in production.
    if (this.configService.get<boolean>('AUTH_DISABLED')) {
      request['user'] = await this.authService.devUser();
      return true;
    }

    const token = request.cookies?.[this.authService.cookieName];
    if (!token) {
      throw new UnauthorizedException('Not signed in');
    }

    const payload = this.authService.verifySessionToken(token);
    request['user'] = { id: payload.sub, email: payload.email };
    return true;
  }
}
