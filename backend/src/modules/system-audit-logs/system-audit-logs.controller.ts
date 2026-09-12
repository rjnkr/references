import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SystemAuditLogDto } from '../../generated/nestjs-dto/systemAuditLog.dto';
import { SystemAuditLogListResponseDto } from './dto/system-audit-log-list-response.dto';
import { QuerySystemAuditLogsDto } from './dto/query-system-audit-logs.dto';
import { SystemAuditLogsService } from './system-audit-logs.service';

/**
 * Read-only: entries are written internally by SystemsService alongside every
 * create/update/delete (see `audit-log.util.ts`), never through this controller.
 */
@Controller('system-audit-logs')
@ApiTags('System Audit Logs')
export class SystemAuditLogsController {
  constructor(private readonly systemAuditLogsService: SystemAuditLogsService) {}

  @Get()
  @ApiOperation({
    summary: 'List the system reference audit trail',
    description:
      'Filtered, sorted (newest first) and paginated. Each entry carries the full system state before and after the change, the changed field names, and who made the change and when.',
  })
  @ApiOkResponse({ type: SystemAuditLogListResponseDto })
  findAll(@Query() query: QuerySystemAuditLogsDto) {
    return this.systemAuditLogsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single audit log entry' })
  @ApiOkResponse({ type: SystemAuditLogDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.systemAuditLogsService.findOne(id);
  }
}
