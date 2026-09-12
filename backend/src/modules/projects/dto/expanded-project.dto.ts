import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectTag } from '@prisma/client';
import { CurrencyDto } from '../../../generated/nestjs-dto/currency.dto';
import { DocumentTypeDto } from '../../../generated/nestjs-dto/documentType.dto';
import { ProjectDto } from '../../../generated/nestjs-dto/project.dto';
import { ProjectCompletionDateDto } from '../../../generated/nestjs-dto/projectCompletionDate.dto';
import { ProjectDocumentDto } from '../../../generated/nestjs-dto/projectDocument.dto';
import { SystemDto } from '../../../generated/nestjs-dto/system.dto';

/**
 * Swagger description of the shape the project endpoints actually return: the
 * generated scalar DTOs with every relation expanded, so the frontend list and
 * detail views need no follow-up requests.
 */

export class ExpandedProjectDocumentDto extends ProjectDocumentDto {
  @ApiProperty({ type: DocumentTypeDto })
  documentType: DocumentTypeDto;
}

export class ExpandedProjectDto extends ProjectDto {
  @ApiProperty({ type: CurrencyDto })
  currency: CurrencyDto;

  @ApiPropertyOptional({ type: SystemDto, nullable: true })
  system?: SystemDto | null;

  // Narrows the generated `Prisma.JsonValue` down to what it actually always is - see
  // `Project.projectType` in the schema.
  @ApiProperty({ enum: ProjectTag, enumName: 'ProjectTag', isArray: true })
  declare projectType: ProjectTag[];

  @ApiProperty({ type: ProjectCompletionDateDto, isArray: true })
  completionDates: ProjectCompletionDateDto[];

  @ApiProperty({ type: ExpandedProjectDocumentDto, isArray: true })
  documents: ExpandedProjectDocumentDto[];
}

export class ProjectListResponseDto {
  @ApiProperty({ type: ExpandedProjectDto, isArray: true })
  data: ExpandedProjectDto[];

  @ApiProperty({ description: 'Total number of projects matching the filters, ignoring paging' })
  total: number;
}
