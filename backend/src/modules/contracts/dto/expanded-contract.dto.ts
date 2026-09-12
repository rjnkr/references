import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContractTag } from '@prisma/client';
import { CurrencyDto } from '../../../generated/nestjs-dto/currency.dto';
import { DocumentTypeDto } from '../../../generated/nestjs-dto/documentType.dto';
import { ContractDto } from '../../../generated/nestjs-dto/contract.dto';
import { ContractCompletionDateDto } from '../../../generated/nestjs-dto/contractCompletionDate.dto';
import { ContractDocumentDto } from '../../../generated/nestjs-dto/contractDocument.dto';
import { SystemDto } from '../../../generated/nestjs-dto/system.dto';

/**
 * Swagger description of the shape the contract endpoints actually return: the
 * generated scalar DTOs with every relation expanded, so the frontend list and
 * detail views need no follow-up requests.
 */

export class ExpandedContractDocumentDto extends ContractDocumentDto {
  @ApiProperty({ type: DocumentTypeDto })
  documentType: DocumentTypeDto;
}

export class ExpandedContractDto extends ContractDto {
  @ApiProperty({ type: CurrencyDto })
  currency: CurrencyDto;

  @ApiPropertyOptional({ type: SystemDto, nullable: true })
  system?: SystemDto | null;

  // Narrows the generated `Prisma.JsonValue` down to what it actually always is - see
  // `Contract.contractType` in the schema.
  @ApiProperty({ enum: ContractTag, enumName: 'ContractTag', isArray: true })
  declare contractType: ContractTag[];

  @ApiProperty({ type: ContractCompletionDateDto, isArray: true })
  completionDates: ContractCompletionDateDto[];

  @ApiProperty({ type: ExpandedContractDocumentDto, isArray: true })
  documents: ExpandedContractDocumentDto[];
}

export class ContractListResponseDto {
  @ApiProperty({ type: ExpandedContractDto, isArray: true })
  data: ExpandedContractDto[];

  @ApiProperty({ description: 'Total number of contracts matching the filters, ignoring paging' })
  total: number;
}
