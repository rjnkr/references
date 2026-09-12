import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

/** Fields a client may sort on. Anything else is rejected. */
export const SORTABLE_CONTRACT_FIELDS = [
  'id',
  'contractNumber',
  'name',
  'awardDate',
  'endDate',
  'implementationPrice',
  'maintenancePricePerYear',
  'currencyId',
  'systemId',
  'pipedriveNumber',
  'createdAt',
  'updatedAt',
] as const;

export class QueryContractsDto {
  @ApiPropertyOptional({ description: 'Free text, matches contractNumber and name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Currency.id' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  currencyId?: number;

  @ApiPropertyOptional({ description: 'System.id - finds the contracts linked to a given system' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  systemId?: number;

  @ApiPropertyOptional({
    description: `Field to sort on, prefix with "-" for descending. One of: ${SORTABLE_CONTRACT_FIELDS.join(', ')}`,
    example: '-awardDate',
  })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 500 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  pageSize?: number = 25;
}
