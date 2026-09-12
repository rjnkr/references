import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { EmptyToUndefined } from '../../../core/validators/empty-to-undefined.transform';

export class SystemExternalInterfaceInput {
  @ApiProperty({ maxLength: 150, example: 'AIS feed - Rijkswaterstaat' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class SystemPersonInput {
  @ApiProperty({ maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiProperty({ maxLength: 100, example: 'Project Manager' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  role: string;

  @ApiPropertyOptional({ maxLength: 150 })
  @EmptyToUndefined()
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;
}

/**
 * Object form accepted for the `ports` array. A bare unlocodeId number is
 * accepted too - see IsUnlocodeRefArray.
 */
export class SystemPortInput {
  @ApiProperty({ description: 'UnLocode.id of the port' })
  @IsInt()
  unlocodeId: number;
}

/** Object form accepted for the `modules` / `subSystems` arrays. */
export class SystemNamedInput {
  @ApiProperty({ maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;
}

export class SystemUrlInput {
  @ApiProperty({ description: 'UrlType.id' })
  @IsInt()
  urlTypeId: number;

  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiProperty({ maxLength: 500, example: 'https://wiki.internal/system-42' })
  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  @MaxLength(500)
  url: string;
}
