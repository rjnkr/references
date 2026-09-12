import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Profile, ValidateInResponseTo } from '@node-saml/node-saml';
import { Strategy as SamlPassportStrategy, VerifiedCallback } from '@node-saml/passport-saml';
import * as passport from 'passport';
import { AuthService } from '../auth.service';

/**
 * Tidalis SSO over SAML 2.0, SP-initiated only.
 *
 * The strategy is registered with passport by hand rather than through
 * @nestjs/passport's PassportStrategy() mixin: @node-saml/passport-saml v5
 * takes two verify callbacks (sign-on and logout) and the mixin only ever
 * appends one.
 *
 * If SAML_IDP_SSO_URL or SAML_IDP_CERT is missing the strategy is NOT
 * registered and a warning is logged - the application still boots so the API
 * can be developed locally before Tidalis IT has handed over the real IdP
 * metadata. SamlAuthGuard then answers 503 on the SSO routes.
 */
@Injectable()
export class SamlStrategy implements OnModuleInit {
  private readonly logger = new Logger(SamlStrategy.name);
  private strategy?: SamlPassportStrategy;

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  onModuleInit(): void {
    const entryPoint = this.configService.get<string>('SAML.IDP_SSO_URL');
    const idpCert = this.configService.get<string>('SAML.IDP_CERT');

    if (!entryPoint || !idpCert) {
      this.logger.warn(
        'SAML SSO is not configured (SAML_IDP_SSO_URL and/or SAML_IDP_CERT are empty). ' +
          'The SSO endpoints will answer 503. Request the identity provider entity id, ' +
          'single sign-on URL and signing certificate from Tidalis IT - see backend/README.md.',
      );
      return;
    }

    const issuer = this.configService.get<string>('SAML.ISSUER');

    this.strategy = new SamlPassportStrategy(
      {
        name: 'saml',
        // --- Service provider (this application) ---
        issuer,
        callbackUrl: this.configService.get<string>('SAML.CALLBACK_URL'),
        audience: this.configService.get<string>('SAML.SP_ENTITY_ID') || issuer,

        // --- Identity provider (Tidalis SSO) ---
        entryPoint,
        idpCert,
        idpIssuer: this.configService.get<string>('SAML.IDP_ENTITY_ID') || undefined,

        // --- Security posture ---
        // SP-initiated only: a response we did not ask for is rejected, which
        // is the equivalent of Sustainsys' AllowUnsolicitedAuthnResponse=false.
        // NOTE: the InResponseTo ids are held in node-saml's default in-memory
        // cache, so logins in flight are lost on restart and this assumes a
        // single instance. Supply a shared cacheProvider when scaling out.
        validateInResponseTo: ValidateInResponseTo.always,
        wantAssertionsSigned: true,
        wantAuthnResponseSigned: true,
        signatureAlgorithm: 'sha256',
        acceptedClockSkewMs: 5000,
        disableRequestedAuthnContext: true,
      },
      // Sign-on verify
      (profile: Profile | null, done: VerifiedCallback) => {
        this.validate(profile, done);
      },
      // Logout verify. Single-logout is not implemented; the local session
      // cookie is dropped by POST /api/auth/logout instead.
      (profile: Profile | null, done: VerifiedCallback) => {
        done(null, (profile ?? {}) as Record<string, unknown>);
      },
    );

    // passport-saml ships its own (older) @types/express, so the Strategy's
    // `authenticate(req)` signature does not line up nominally with the one
    // @types/passport expects. Structurally they are the same.
    passport.use('saml', this.strategy as unknown as passport.Strategy);
    this.logger.log(`SAML SSO configured (IdP ${entryPoint})`);
  }

  get isConfigured(): boolean {
    return this.strategy !== undefined;
  }

  /**
   * Extracts the e-mail from the assertion, provisions/refreshes the User row
   * and hands the user back to passport.
   */
  async validate(profile: Profile | null, done: VerifiedCallback): Promise<void> {
    try {
      if (!profile) {
        return done(new Error('SAML assertion did not contain a profile'));
      }

      const email = this.extractEmail(profile);
      if (!email) {
        return done(
          new Error('SAML assertion did not contain an e-mail address (nameID / email / mail)'),
        );
      }

      const user = await this.authService.upsertUser(email, this.extractName(profile));
      this.logger.log(`SAML login for ${user.email}`);

      return done(null, { id: user.id, email: user.email, name: user.name });
    } catch (e) {
      this.logger.error(`SAML validation failed: ${e.message}`);
      return done(e);
    }
  }

  private extractEmail(profile: Profile): string | undefined {
    const candidates = [
      profile.email,
      profile.mail,
      profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
      profile['urn:oid:0.9.2342.19200300.100.1.3'],
      profile.nameID,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.includes('@')) {
        return candidate;
      }
    }
    return undefined;
  }

  private extractName(profile: Profile): string | undefined {
    const configured = this.configService.get<string>('SAML.NAME_ATTRIBUTE');
    const candidates = [
      configured ? profile[configured] : undefined,
      profile.displayName,
      profile['http://schemas.microsoft.com/identity/claims/displayname'],
      profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
      profile['urn:oid:2.16.840.1.113730.3.1.241'],
    ];

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim();
      }
    }
    return undefined;
  }

  /**
   * SP metadata XML. Hand this to Tidalis IT so they can register this
   * application in the identity provider.
   */
  generateServiceProviderMetadata(): string | undefined {
    return this.strategy?.generateServiceProviderMetadata(null, null);
  }
}
