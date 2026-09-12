import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { lastLine } from './log-helper';

/**
 * Catch-all for the remaining Prisma error classes (unknown request errors,
 * initialisation failures, engine panics). None of these are the client's
 * fault, so they map to 500.
 */
@Catch(
  Prisma.PrismaClientUnknownRequestError,
  Prisma.PrismaClientInitializationError,
  Prisma.PrismaClientRustPanicError,
)
export class PrismaDefaultErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaDefaultErrorFilter.name);

  catch(
    exception:
      | Prisma.PrismaClientUnknownRequestError
      | Prisma.PrismaClientInitializationError
      | Prisma.PrismaClientRustPanicError,
    host: ArgumentsHost,
  ) {
    this.logger.error(`Prisma error -> HTTP 500: ${lastLine(exception.message)}`);

    const response = host.switchToHttp().getResponse<Response>();
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Database is unavailable or returned an unexpected error',
      error: 'Prisma error',
    });
  }
}
