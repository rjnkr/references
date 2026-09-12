import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { lastLine } from './log-helper';

/**
 * A PrismaClientValidationError means we handed Prisma a malformed query -
 * usually caused by bad client input that slipped past the ValidationPipe.
 */
@Catch(Prisma.PrismaClientValidationError)
export class PrismaValidationErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaValidationErrorFilter.name);

  catch(exception: Prisma.PrismaClientValidationError, host: ArgumentsHost) {
    const message = lastLine(exception.message);
    this.logger.error(`Prisma validation error -> HTTP 400: ${message}`);

    const response = host.switchToHttp().getResponse<Response>();
    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message,
      error: 'Prisma validation error',
    });
  }
}
