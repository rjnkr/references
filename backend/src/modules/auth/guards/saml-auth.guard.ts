import { ExecutionContext, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SamlStrategy } from '../strategies/saml.strategy';

/**
 * AuthGuard('saml') with a friendlier answer when the identity provider has
 * not been configured yet - otherwise passport throws "Unknown authentication
 * strategy" and the caller gets an opaque 500.
 */
@Injectable()
export class SamlAuthGuard extends AuthGuard('saml') {
  constructor(private readonly samlStrategy: SamlStrategy) {
    super();
  }

  canActivate(context: ExecutionContext) {
    if (!this.samlStrategy.isConfigured) {
      throw new ServiceUnavailableException(
        'SAML SSO is not configured on this server. Set SAML_IDP_SSO_URL and SAML_IDP_CERT ' +
          '(obtain them from Tidalis IT) and restart the API.',
      );
    }
    return super.canActivate(context);
  }
}
