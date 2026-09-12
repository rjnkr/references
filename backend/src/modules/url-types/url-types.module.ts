import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { UrlTypesController } from './url-types.controller';
import { UrlTypesService } from './url-types.service';

@Module({
  imports: [CoreModule],
  controllers: [UrlTypesController],
  providers: [UrlTypesService],
  exports: [UrlTypesService],
})
export class UrlTypesModule {}
