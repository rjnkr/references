import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContractType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { EmptyToUndefined } from '../../../core/validators/empty-to-undefined.transform';
import {
  IsModuleRefArray,
  IsNamedRefArray,
  IsTagRefArray,
  IsUnlocodeRefArray,
} from '../../../core/validators/loose-array.validator';
import { MaxWords } from '../../../core/validators/max-words.validator';
import { SystemExternalInterfaceInput, SystemPersonInput, SystemUrlInput } from './system-children.dto';

/**
 * Full nested payload for POST /api/systems. Scalar system fields plus every
 * child collection, created in a single transaction.
 */
export class CreateSystemRequestDto {
  // --- identification -------------------------------------------------------

  @ApiProperty({ maxLength: 100, example: 'Port of Rotterdam VTS' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  // --- content --------------------------------------------------------------

  @ApiProperty({ description: 'Free text scope of the system, at most 200 words' })
  @IsString()
  @IsNotEmpty()
  @MaxWords(200)
  scope: string;

  @ApiProperty({ enum: ContractType, enumName: 'ContractType' })
  @IsEnum(ContractType)
  contractType: ContractType;

  @ApiProperty({ maxLength: 100, description: 'Free text list of products used' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  products: string;

  @ApiPropertyOptional({ description: 'Full free text description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerDetails?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endUserDetails?: string;

  @ApiPropertyOptional({
    description:
      'Internal note - Tidalis employees only. Never surfaced to customers or through any ' +
      'public-facing output (AI/MCP tools, reference search, customer-facing exports).',
  })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiProperty({ description: 'Country.id' })
  @Type(() => Number)
  @IsInt()
  countryId: number;

  @ApiProperty({
    description:
      "UnLocode.id where the delivered system itself is installed - the system's own " +
      '"main" location, distinct from every port it may additionally reference',
  })
  @Type(() => Number)
  @IsInt()
  systemUnlocodeId: number;

  // --- point of contact -----------------------------------------------------

  @ApiPropertyOptional({ maxLength: 150 })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  pocName?: string;

  @ApiPropertyOptional({ maxLength: 150 })
  @EmptyToUndefined()
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  pocEmail?: string;

  @ApiPropertyOptional({ maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  pocPhone?: string;

  // --- flags ----------------------------------------------------------------

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isSensitive?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  canBeUsedAsReference?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  systemDecommissioned?: boolean;

  // --- child collections ----------------------------------------------------

  @ApiPropertyOptional({
    description: 'UnLocode ids, e.g. [12, 34]. Objects of shape { unlocodeId } are accepted too.',
    type: Number,
    isArray: true,
    example: [12, 34],
  })
  @IsOptional()
  @IsUnlocodeRefArray()
  ports?: (number | { unlocodeId: number })[];

  @ApiProperty({
    description:
      'Module ids, e.g. [1, 2]. Objects of shape { moduleId } are accepted too. A system ' +
      'must have at least one module.',
    type: Number,
    isArray: true,
    example: [1, 2],
  })
  @IsModuleRefArray(1)
  modules: (number | { moduleId: number })[];

  @ApiPropertyOptional({
    description: 'Sub-system names, e.g. ["VHF", "CCTV"]. Objects of shape { name } accepted too.',
    type: String,
    isArray: true,
    example: ['VHF', 'CCTV', 'Radar'],
  })
  @IsOptional()
  @IsNamedRefArray(150)
  subSystems?: (string | { name: string })[];

  @ApiPropertyOptional({ type: SystemExternalInterfaceInput, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SystemExternalInterfaceInput)
  externalInterfaces?: SystemExternalInterfaceInput[];

  @ApiPropertyOptional({ type: SystemPersonInput, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SystemPersonInput)
  people?: SystemPersonInput[];

  @ApiPropertyOptional({
    description: 'Tag ids, e.g. [1, 2]. Objects of shape { tagId } are accepted too.',
    type: Number,
    isArray: true,
    example: [1, 2],
  })
  @IsOptional()
  @IsTagRefArray()
  tags?: (number | { tagId: number })[];

  @ApiPropertyOptional({ type: SystemUrlInput, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SystemUrlInput)
  urls?: SystemUrlInput[];
}
