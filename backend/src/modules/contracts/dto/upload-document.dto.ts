import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

/**
 * Non-file fields of the multipart upload. Exactly one of `documentType` /
 * `documentTypeId` must be supplied - both names are accepted so the field can
 * be called either way on the client.
 */
export class UploadContractDocumentDto {
  @ApiPropertyOptional({ description: 'DocumentType.id (preferred field name)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  documentType?: number;

  @ApiPropertyOptional({ description: 'DocumentType.id (alias for documentType)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  documentTypeId?: number;
}
