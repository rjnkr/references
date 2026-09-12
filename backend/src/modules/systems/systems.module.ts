import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { SystemDocumentsController } from './system-documents.controller';
import { SystemDocumentsService } from './system-documents.service';
import { SystemsController } from './systems.controller';
import { SystemsService } from './systems.service';

@Module({
  imports: [CoreModule],
  controllers: [SystemsController, SystemDocumentsController],
  providers: [SystemsService, SystemDocumentsService],
  exports: [SystemsService, SystemDocumentsService],
})
export class SystemsModule {}
