import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { MapController } from './map.controller';
import { MapService } from './map.service';

@Module({
  imports: [CoreModule],
  controllers: [MapController],
  providers: [MapService],
  exports: [MapService],
})
export class MapModule {}
