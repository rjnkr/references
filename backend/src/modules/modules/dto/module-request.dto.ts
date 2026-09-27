import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, Min } from 'class-validator';
import { CreateModuleDto } from '../../../generated/nestjs-dto/create-module.dto';

/** POST /api/modules: the module's own fields plus the products it references. */
export class CreateModuleRequestDto extends CreateModuleDto {
  @ApiPropertyOptional({
    type: [Number],
    example: [1, 2],
    description: 'Ids of the products this module references; replaces the current set on update.',
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  productIds?: number[];
}

/** PATCH /api/modules/:id: every field optional; `productIds`, when sent, replaces the set. */
export class UpdateModuleRequestDto extends PartialType(CreateModuleRequestDto) {}
