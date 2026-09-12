import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { SystemAuditLogsController } from './system-audit-logs.controller';
import { SystemAuditLogsService } from './system-audit-logs.service';

@Module({
  imports: [CoreModule],
  controllers: [SystemAuditLogsController],
  providers: [SystemAuditLogsService],
})
export class SystemAuditLogsModule {}
