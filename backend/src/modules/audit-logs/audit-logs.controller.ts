import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProjectAuditLogDto } from '../../generated/nestjs-dto/projectAuditLog.dto';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogListResponseDto } from './dto/audit-log-list-response.dto';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';

/**
 * Read-only: entries are written internally by ProjectsService alongside every
 * create/update/delete (see `audit-log.util.ts`), never through this controller.
 */
@Controller('audit-logs')
@ApiTags('Audit Logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({
    summary: 'List the project reference audit trail',
    description:
      'Filtered, sorted (newest first) and paginated. Each entry carries the full project state before and after the change, the changed field names, and who made the change and when.',
  })
  @ApiOkResponse({ type: AuditLogListResponseDto })
  findAll(@Query() query: QueryAuditLogsDto) {
    return this.auditLogsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single audit log entry' })
  @ApiOkResponse({ type: ProjectAuditLogDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.auditLogsService.findOne(id);
  }
}
