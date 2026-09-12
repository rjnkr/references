import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { UnlocodesController } from './unlocodes.controller';
import { UnlocodesService } from './unlocodes.service';

@Module({
  imports: [CoreModule],
  controllers: [UnlocodesController],
  providers: [UnlocodesService],
  exports: [UnlocodesService],
})
export class UnlocodesModule {}
