import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Public } from '../../core/decorators/public.decorator';
import { SessionUser } from '../../core/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { SamlAuthGuard } from './guards/saml-auth.guard';
import { SamlStrategy } from './strategies/saml.strategy';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly samlStrategy: SamlStrategy,
    private readonly configService: ConfigService,
  ) {}

  // -------------------------------------------------------------------------
  // SAML handshake (SP-initiated)
  // -------------------------------------------------------------------------

  @Public()
  @UseGuards(SamlAuthGuard)
  @Get('saml/login')
  @ApiOperation({
    summary: 'Start SSO',
    description:
      'Redirects the browser to the Tidalis identity provider. Point the frontend at this URL to sign in.',
  })
  login(): void {
    // Never reached: the guard issues the redirect to the IdP.
  }

  @Public()
  @UseGuards(SamlAuthGuard)
  @Post('saml/callback')
  @ApiOperation({
    summary: 'SAML assertion consumer service',
    description:
      'The identity provider POSTs the SAML response here (HTTP-POST binding). On success a signed httpOnly session cookie is set and the browser is redirected to the frontend.',
  })
  async callback(@Req() req: Request, @Res() res: Response): Promise<void> {
    const user = req.user as SessionUser;
    if (!user) {
      throw new UnauthorizedException('SAML authentication did not yield a user');
    }

    const token = await this.authService.signSessionToken(user);
    this.authService.setSessionCookie(res, token);

    const frontend = this.configService.get<string>('FRONTEND_ORIGIN');
    this.logger.log(`Session established for ${user.email}, redirecting to ${frontend}`);
    res.redirect(`${frontend}/`);
  }

  @Public()
  @Get('saml/metadata')
  @ApiExcludeEndpoint()
  @ApiOperation({
    summary: 'Service provider metadata',
    description: 'The SP metadata XML to hand to Tidalis IT when registering this application.',
  })
  metadata(@Res() res: Response): void {
    const xml = this.samlStrategy.generateServiceProviderMetadata();
    if (!xml) {
      throw new NotFoundException(
        'SAML is not configured, so no service provider metadata can be generated',
      );
    }
    res.type('application/xml').send(xml);
  }

  // -------------------------------------------------------------------------
  // Session
  // -------------------------------------------------------------------------

  @Public()
  @Get('me')
  @ApiOperation({ summary: 'The signed-in user, or 401' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        email: { type: 'string' },
        name: { type: 'string', nullable: true },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'No valid session cookie present' })
  async me(@Req() req: Request): Promise<SessionUser> {
    if (this.configService.get<boolean>('AUTH_DISABLED')) {
      return this.authService.devUser();
    }

    const token = req.cookies?.[this.authService.cookieName];
    if (!token) {
      throw new UnauthorizedException('Not signed in');
    }

    const payload = this.authService.verifySessionToken(token);
    const user = await this.authService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('The account for this session no longer exists');
    }

    return { id: user.id, email: user.email, name: user.name };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear the session cookie' })
  logout(@Res({ passthrough: true }) res: Response): void {
    this.authService.clearSessionCookie(res);
  }
}
