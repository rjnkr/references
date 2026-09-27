import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContractType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

/** Query string parameters are always strings, so booleans need coercing. */
const toBoolean = ({ value }: { value: unknown }) => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (value === 'true' || value === '1') {
    return true;
  }
  if (value === 'false' || value === '0') {
    return false;
  }
  return value;
};

/** Fields a client may sort on. Anything else is rejected. */
export const SORTABLE_SYSTEM_FIELDS = [
  'id',
  'name',
  'contractType',
  'countryId',
  'isSensitive',
  'canBeUsedAsReference',
  'systemDecommissioned',
  'pocName',
  'createdAt',
  'updatedAt',
] as const;

export class QuerySystemsDto {
  @ApiPropertyOptional({ description: 'Free text, matches name and product code/name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ContractType, enumName: 'ContractType' })
  @IsOptional()
  @IsEnum(ContractType)
  contractType?: ContractType;

  @ApiPropertyOptional({ description: 'Country.id' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  countryId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isSensitive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  canBeUsedAsReference?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  systemDecommissioned?: boolean;

  @ApiPropertyOptional({
    description: `Field to sort on, prefix with "-" for descending. One of: ${SORTABLE_SYSTEM_FIELDS.join(', ')}`,
    example: 'name',
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
