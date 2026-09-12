import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ContractAuditLogDto } from '../../generated/nestjs-dto/contractAuditLog.dto';
import { ContractAuditLogsService } from './contract-audit-logs.service';
import { ContractAuditLogListResponseDto } from './dto/contract-audit-log-list-response.dto';
import { QueryContractAuditLogsDto } from './dto/query-contract-audit-logs.dto';

/**
 * Read-only: entries are written internally by ContractsService alongside every
 * create/update/delete (see `audit-log.util.ts`), never through this controller.
 */
@Controller('contract-audit-logs')
@ApiTags('Contract Audit Logs')
export class ContractAuditLogsController {
  constructor(private readonly auditLogsService: ContractAuditLogsService) {}

  @Get()
  @ApiOperation({
    summary: 'List the contract reference audit trail',
    description:
      'Filtered, sorted (newest first) and paginated. Each entry carries the full contract state before and after the change, the changed field names, and who made the change and when.',
  })
  @ApiOkResponse({ type: ContractAuditLogListResponseDto })
  findAll(@Query() query: QueryContractAuditLogsDto) {
    return this.auditLogsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single audit log entry' })
  @ApiOkResponse({ type: ContractAuditLogDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.auditLogsService.findOne(id);
  }
}
