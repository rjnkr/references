import { ApiProperty } from '@nestjs/swagger';
import { ContractAuditLogDto } from '../../../generated/nestjs-dto/contractAuditLog.dto';

export class ContractAuditLogListResponseDto {
  @ApiProperty({ type: ContractAuditLogDto, isArray: true })
  data: ContractAuditLogDto[];

  @ApiProperty({ description: 'Total number of entries matching the filters, ignoring paging' })
  total: number;
}
