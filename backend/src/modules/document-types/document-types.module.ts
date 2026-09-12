import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { DocumentTypesController } from './document-types.controller';
import { DocumentTypesService } from './document-types.service';

@Module({
  imports: [CoreModule],
  controllers: [DocumentTypesController],
  providers: [DocumentTypesService],
  exports: [DocumentTypesService],
})
export class DocumentTypesModule {}
