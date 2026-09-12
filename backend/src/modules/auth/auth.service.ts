import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { Response } from 'express';
import { DbService } from '../../database/db-service/db.service';
import { SessionUser } from '../../core/decorators/current-user.decorator';

export interface SessionTokenPayload {
  sub: number;
  email: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly db: DbService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  get cookieName(): string {
    return this.configService.get<string>('SESSION.COOKIE_NAME') ?? 'tidalis_session';
  }

  /**
   * Auto-provisions the user on first login. Everyone who can authenticate
   * against the Tidalis IdP is a Tidalis employee, so there is no separate
   * account request step - the IdP is the gate.
   */
  async upsertUser(email: string, name?: string | null): Promise<User> {
    const normalised = email.trim().toLowerCase();

    return this.db.user.upsert({
      where: { email: normalised },
      update: { lastLoginAt: new Date(), ...(name ? { name } : {}) },
      create: { email: normalised, name: name ?? null, lastLoginAt: new Date() },
    });
  }

  /** Signs the session JWT that goes into the httpOnly cookie. */
  signSessionToken(user: Pick<User, 'id' | 'email'>): Promise<string> {
    const payload: SessionTokenPayload = { sub: user.id, email: user.email };
    return this.jwtService.signAsync(payload);
  }

  verifySessionToken(token: string): SessionTokenPayload {
    try {
      return this.jwtService.verify<SessionTokenPayload>(token);
    } catch (e) {
      throw new UnauthorizedException('Session is invalid or has expired');
    }
  }

  /**
   * Server-side session: a signed, httpOnly cookie. `secure` is only set in
   * production because local development runs over plain http.
   */
  setSessionCookie(res: Response, token: string): void {
    res.cookie(this.cookieName, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }

  clearSessionCookie(res: Response): void {
    res.clearCookie(this.cookieName, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }

  findById(id: number): Promise<User | null> {
    return this.db.user.findUnique({ where: { id } });
  }

  private devUserCache?: Promise<SessionUser>;

  /**
   * Used by the AUTH_DISABLED local-development path so /api/auth/me still
   * answers with something usable. The frontend fires several requests in
   * parallel on load, and every request goes through this guard - upserting
   * on every single call causes concurrent writes to the same row, which
   * MariaDB rejects (error 1020, "Record has changed since last read").
   * Upsert once per process and cache the result instead.
   */
  devUser(): Promise<SessionUser> {
    if (!this.devUserCache) {
      const email = this.configService.get<string>('DEV_USER_EMAIL') ?? 'dev@tidalis.com';
      this.devUserCache = this.upsertUser(email, 'local user')
        .then((user) => ({ id: user.id, email: user.email, name: user.name }))
        .catch((err) => {
          this.devUserCache = undefined;
          throw err;
        });
    }
    return this.devUserCache;
  }
}
