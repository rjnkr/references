import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { ContractAuditLogsController } from './contract-audit-logs.controller';
import { ContractAuditLogsService } from './contract-audit-logs.service';

@Module({
  imports: [CoreModule],
  controllers: [ContractAuditLogsController],
  providers: [ContractAuditLogsService],
})
export class ContractAuditLogsModule {}
