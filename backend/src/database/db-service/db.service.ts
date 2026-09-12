import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@prisma/client';

/**
 * Thin wrapper around PrismaClient so it can be injected as a Nest provider.
 * Provided and exported by CoreModule; feature modules import CoreModule.
 */
@Injectable()
export class DbService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DbService.name);

  constructor(private readonly configService: ConfigService) {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
    });
  }

  async onModuleInit() {
    // Errors and warnings are always surfaced; individual queries only when
    // LOG_SQL=true, otherwise a read-heavy app drowns the log.
    this.$on('error' as never, (event: Prisma.LogEvent) => {
      this.logger.error(`Prisma error: ${event.message}`);
    });

    this.$on('warn' as never, (event: Prisma.LogEvent) => {
      this.logger.warn(`Prisma warning: ${event.message}`);
    });

    if (this.configService.get<boolean>('LOGGING.SQL')) {
      this.$on('info' as never, (event: Prisma.LogEvent) => {
        this.logger.debug(`Prisma info: ${event.message}`);
      });

      this.$on('query' as never, (event: Prisma.QueryEvent) => {
        this.logger.debug(`Query (${event.duration}ms): ${event.query} - params ${event.params}`);
      });
    }

    try {
      await this.$connect();
    } catch (e) {
      // Do not take the whole app down when the database is briefly
      // unavailable; Prisma reconnects lazily on the first query.
      this.logger.error(`Could not connect to the database at boot: ${e.message}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
