import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import config from './config/configuration';
import { CoreModule } from './core/core.module';
import { McpModule } from './mcp/mcp.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtCookieAuthGuard } from './modules/auth/guards/jwt-cookie-auth.guard';
import { CountriesModule } from './modules/countries/countries.module';
import { CurrenciesModule } from './modules/currencies/currencies.module';
import { DocumentTypesModule } from './modules/document-types/document-types.module';
import { MapModule } from './modules/map/map.module';
import { ModulesModule } from './modules/modules/modules.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { SystemAuditLogsModule } from './modules/system-audit-logs/system-audit-logs.module';
import { SystemsModule } from './modules/systems/systems.module';
import { TagsModule } from './modules/tags/tags.module';
import { UnlocodesModule } from './modules/unlocodes/unlocodes.module';
import { UrlTypesModule } from './modules/url-types/url-types.module';

@Module({
  imports: [
    // Must come first so every other module can inject ConfigService.
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    CoreModule,
    AuthModule,
    CurrenciesModule,
    CountriesModule,
    UnlocodesModule,
    DocumentTypesModule,
    UrlTypesModule,
    TagsModule,
    ModulesModule,
    ProjectsModule,
    SystemsModule,
    MapModule,
    McpModule,
    AuditLogsModule,
    SystemAuditLogsModule,
  ],
  providers: [
    // Everything is behind the session cookie unless it is marked @Public().
    {
      provide: APP_GUARD,
      useClass: JwtCookieAuthGuard,
    },
  ],
})
export class AppModule {}
