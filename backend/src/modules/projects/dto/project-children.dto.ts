import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class ProjectCompletionDateInput {
  @ApiProperty({
    description: 'Date the customer accepted delivery (date only)',
    example: '2024-06-30',
  })
  @IsDateString()
  completionDate: string;

  @ApiPropertyOptional({ description: 'What was delivered, e.g. "Phase 1"', maxLength: 150 })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  description?: string;
}

export class ProjectUrlInput {
  @ApiProperty({ description: 'UrlType.id' })
  @IsInt()
  urlTypeId: number;

  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiProperty({ maxLength: 500, example: 'https://tidalis.pipedrive.com/deal/123' })
  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  @MaxLength(500)
  url: string;
}
