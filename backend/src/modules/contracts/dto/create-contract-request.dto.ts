import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContractTag } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { EmptyToUndefined } from '../../../core/validators/empty-to-undefined.transform';
import { IsTagRefArray } from '../../../core/validators/loose-array.validator';
import { ContractCompletionDateInput, ContractUrlInput } from './contract-children.dto';

/**
 * Full nested payload for POST /api/contracts. Scalar contract fields plus every
 * child collection, created in a single transaction.
 */
export class CreateContractRequestDto {
  // --- identification -------------------------------------------------------

  // `contractNumber` is `@unique` in the DB - a blank string would collide with every
  // other contract created without one, so it needs `EmptyToUndefined` (not just
  // `@IsOptional`) to turn a blank form field into "omit this column" (-> NULL),
  // the same as null-safe uniqueness expects.
  @ApiPropertyOptional({ maxLength: 50, example: 'TID-2024-017' })
  @EmptyToUndefined()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  contractNumber?: string;

  @ApiPropertyOptional({ maxLength: 100, example: 'Port of Rotterdam VTS replacement' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ description: 'Date the contract was awarded (date only)', example: '2024-02-01' })
  @IsDateString()
  awardDate: string;

  @ApiPropertyOptional({
    description: 'Date the contract ended, or is expected to end (date only)',
    example: '2024-12-31',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  @ApiPropertyOptional({
    enum: ContractTag,
    enumName: 'ContractTag',
    isArray: true,
    description:
      'Multi-select: which phase(s) this contract covers - implementation, Support & ' +
      'Maintenance, or both. Not to be confused with System.contractType.',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ContractTag, { each: true })
  contractType?: ContractTag[];

  @ApiPropertyOptional({
    description:
      'System.id this contract relates to. Not every contract links to a System, and several ' +
      'contracts (e.g. an implementation plus later maintenance renewals) can link to the same one.',
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  systemId?: number | null;

  // --- financials -----------------------------------------------------------

  @ApiProperty({ description: 'Implementation price in whole currency units', example: 4500000 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  implementationPrice: number;

  @ApiProperty({ description: 'Yearly maintenance price in whole currency units', example: 320000 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maintenancePricePerYear: number;

  @ApiProperty({ description: 'Currency.id' })
  @Type(() => Number)
  @IsInt()
  currencyId: number;

  // --- extra narrative ------------------------------------------------------

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  newDevelopments?: string;

  @ApiPropertyOptional({ description: 'What was special about this implementation' })
  @IsOptional()
  @IsString()
  implementationDetails?: string;

  @ApiPropertyOptional({ maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  pipedriveNumber?: string;

  @ApiPropertyOptional({
    description:
      'Internal note - Tidalis employees only. Never surfaced to customers or through any ' +
      'public-facing output (AI/MCP tools, reference search, customer-facing exports).',
  })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  // --- child collections ----------------------------------------------------

  @ApiPropertyOptional({ type: ContractCompletionDateInput, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContractCompletionDateInput)
  completionDates?: ContractCompletionDateInput[];

  @ApiPropertyOptional({ type: ContractUrlInput, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContractUrlInput)
  urls?: ContractUrlInput[];

  @ApiPropertyOptional({
    description: 'Tag ids, e.g. [1, 2]. Objects of shape { tagId } are accepted too.',
    type: Number,
    isArray: true,
    example: [1, 2],
  })
  @IsOptional()
  @IsTagRefArray()
  tags?: (number | { tagId: number })[];
}
