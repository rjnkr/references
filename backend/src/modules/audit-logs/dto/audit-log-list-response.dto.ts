import { ApiProperty } from '@nestjs/swagger';
import { ProjectAuditLogDto } from '../../../generated/nestjs-dto/projectAuditLog.dto';

export class AuditLogListResponseDto {
  @ApiProperty({ type: ProjectAuditLogDto, isArray: true })
  data: ProjectAuditLogDto[];

  @ApiProperty({ description: 'Total number of entries matching the filters, ignoring paging' })
  total: number;
}
