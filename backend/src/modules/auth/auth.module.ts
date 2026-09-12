import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CoreModule } from '../../core/core.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtCookieAuthGuard } from './guards/jwt-cookie-auth.guard';
import { SamlAuthGuard } from './guards/saml-auth.guard';
import { SamlStrategy } from './strategies/saml.strategy';

@Module({
  imports: [
    CoreModule,
    // No passport session: the session lives entirely in the signed cookie.
    PassportModule.register({ session: false }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.get<string>('SESSION.JWT_SECRET'),
        // ms-style duration string, e.g. "8h" - @nestjs/jwt types this as a
        // template literal union, so it needs a cast coming from env.
        signOptions: {
          expiresIn: configService.get<string>('SESSION.JWT_EXPIRES_IN') as never,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SamlStrategy, SamlAuthGuard, JwtCookieAuthGuard],
  exports: [AuthService, JwtCookieAuthGuard],
})
export class AuthModule {}
