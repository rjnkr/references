import { Module } from '@nestjs/common';
import { DbService } from '../database/db-service/db.service';
import { DocumentStorageService } from './document-storage.service';

/**
 * Small shared module that owns the Prisma connection and other cross-cutting
 * infrastructure. Every feature module imports this to get `DbService` (and,
 * where documents are uploaded, `DocumentStorageService`) injected.
 */
@Module({
  providers: [DbService, DocumentStorageService],
  exports: [DbService, DocumentStorageService],
})
export class CoreModule {}
