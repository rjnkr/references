import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { lastLine } from './log-helper';

/**
 * Maps Prisma's known request errors onto sensible HTTP statuses.
 * Reference: https://www.prisma.io/docs/orm/reference/error-reference
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaKnownRequestErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaKnownRequestErrorFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error';

    switch (exception.code) {
      // Unique constraint violation - the record already exists.
      case 'P2002': {
        const target = exception.meta?.target;
        const fields = Array.isArray(target) ? target.join(', ') : String(target ?? 'field');
        status = HttpStatus.CONFLICT;
        message = `A record with the same ${fields} already exists`;
        break;
      }

      // Foreign key constraint failed - the client referenced something that
      // does not exist (or is still referenced elsewhere).
      case 'P2003':
      case 'P2014': {
        status = HttpStatus.BAD_REQUEST;
        message = `Invalid reference: ${exception.meta?.field_name ?? 'related record'} does not exist or is still in use`;
        break;
      }

      // Record required by the operation was not found.
      case 'P2001':
      case 'P2015':
      case 'P2018':
      case 'P2025': {
        status = HttpStatus.NOT_FOUND;
        message = 'The requested record does not exist';
        break;
      }

      // Value too long / out of range for the column, or bad input value.
      case 'P2000':
      case 'P2006':
      case 'P2011':
      case 'P2019':
      case 'P2020': {
        status = HttpStatus.BAD_REQUEST;
        message = lastLine(exception.message);
        break;
      }

      default: {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = `Database error (${exception.code})`;
        break;
      }
    }

    this.logger.error(`Prisma ${exception.code} -> HTTP ${status}: ${lastLine(exception.message)}`);
    this.send(host, status, message, exception.code);
  }

  private send(host: ArgumentsHost, status: number, message: string, code: string) {
    const response = host.switchToHttp().getResponse<Response>();
    response.status(status).json({
      statusCode: status,
      message,
      error: 'Prisma error',
      code,
    });
  }
}
