import { BadRequestException, Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { PrismaDefaultErrorFilter } from './core/filters/prisma-default-error.filter';
import { PrismaKnownRequestErrorFilter } from './core/filters/prisma-known-request-error.filter';
import { PrismaValidationErrorFilter } from './core/filters/prisma-validation-error.filter';

function setupSwagger(app: NestExpressApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Tidalis Project References API')
    .setDescription(
      'Internal API for recording Tidalis project references: project metadata, financials, ' +
        'ports, documents and the people involved. Authentication is a `tidalis_session` ' +
        'httpOnly cookie issued after Tidalis SSO (SAML 2.0); see /api/auth/saml/login.',
    )
    .setVersion('1.0')
    .addCookieAuth('tidalis_session')
    .addTag('Projects')
    .addTag('Project documents')
    .addTag('Currencies')
    .addTag('Countries')
    .addTag('UN/LOCODEs')
    .addTag('Document types')
    .addTag('Map')
    .addTag('Authentication')
    .addTag('MCP')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Mounted outside the global /api prefix.
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      withCredentials: true,
    },
  });
}

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // The Angular frontend runs on a different origin and sends the session
  // cookie, so credentials must be allowed explicitly.
  app.enableCors({
    credentials: true,
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:4200',
  });

  // Needed to read the tidalis_session cookie.
  app.use(cookieParser());

  // All REST routes live under /api. /docs and the MCP endpoints are excluded;
  // the MCP paths are listed one by one rather than with a wildcard so the
  // behaviour does not depend on path-to-regexp's wildcard syntax.
  app.setGlobalPrefix('api', {
    exclude: [
      { path: 'mcp', method: RequestMethod.ALL },
      { path: 'mcp/sse', method: RequestMethod.ALL },
      { path: 'mcp/messages', method: RequestMethod.ALL },
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        // Surface the first concrete constraint message instead of Nest's
        // nested error array - much easier to show in the UI.
        const first = errors[0];
        const constraints = first?.constraints ?? first?.children?.[0]?.constraints;
        const message = constraints
          ? constraints[Object.keys(constraints)[0]]
          : `Validation failed for "${first?.property}"`;
        return new BadRequestException(message);
      },
    }),
  );

  // Prisma exception filters. Registration order matters: the last filter
  // registered for a given exception type wins, so the most specific one
  // (KnownRequestError) goes last.
  app.useGlobalFilters(
    new PrismaDefaultErrorFilter(),
    new PrismaValidationErrorFilter(),
    new PrismaKnownRequestErrorFilter(),
  );

  setupSwagger(app);

  const port = parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port);

  logger.log(`API listening on http://localhost:${port}/api`);
  logger.log(`Swagger docs on http://localhost:${port}/docs`);
  logger.log(`MCP (SSE) endpoint on http://localhost:${port}/mcp/sse`);
}

void bootstrap();
