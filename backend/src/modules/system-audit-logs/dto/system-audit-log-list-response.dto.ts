import { ApiProperty } from '@nestjs/swagger';
import { SystemAuditLogDto } from '../../../generated/nestjs-dto/systemAuditLog.dto';

export class SystemAuditLogListResponseDto {
  @ApiProperty({ type: SystemAuditLogDto, isArray: true })
  data: SystemAuditLogDto[];

  @ApiProperty({ description: 'Total number of entries matching the filters, ignoring paging' })
  total: number;
}
