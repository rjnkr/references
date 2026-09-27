import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CountryDto } from '../../../generated/nestjs-dto/country.dto';
import { DocumentTypeDto } from '../../../generated/nestjs-dto/documentType.dto';
import { SystemDto } from '../../../generated/nestjs-dto/system.dto';
import { SystemDocumentDto } from '../../../generated/nestjs-dto/systemDocument.dto';
import { SystemExternalInterfaceDto } from '../../../generated/nestjs-dto/systemExternalInterface.dto';
import { SystemModuleDto } from '../../../generated/nestjs-dto/systemModule.dto';
import { ProductDto } from '../../../generated/nestjs-dto/product.dto';
import { SystemProductDto } from '../../../generated/nestjs-dto/systemProduct.dto';
import { SystemPersonDto } from '../../../generated/nestjs-dto/systemPerson.dto';
import { SystemPortDto } from '../../../generated/nestjs-dto/systemPort.dto';
import { SystemSubSystemDto } from '../../../generated/nestjs-dto/systemSubSystem.dto';
import { UnLocodeDto } from '../../../generated/nestjs-dto/unLocode.dto';

/**
 * Swagger description of the shape the system endpoints actually return: the
 * generated scalar DTOs with every relation expanded, so the frontend list and
 * detail views need no follow-up requests.
 */

export class ExpandedSystemUnLocodeDto extends UnLocodeDto {
  @ApiPropertyOptional({ type: CountryDto, nullable: true })
  country?: CountryDto | null;
}

export class ExpandedSystemPortDto extends SystemPortDto {
  @ApiProperty({ type: ExpandedSystemUnLocodeDto })
  unlocode: ExpandedSystemUnLocodeDto;
}

export class ExpandedSystemDocumentDto extends SystemDocumentDto {
  @ApiProperty({ type: DocumentTypeDto })
  documentType: DocumentTypeDto;
}

export class ExpandedSystemProductDto extends SystemProductDto {
  @ApiProperty({ type: ProductDto })
  product: ProductDto;
}

export class ExpandedSystemDto extends SystemDto {
  @ApiProperty({ type: CountryDto })
  country: CountryDto;

  @ApiProperty({ type: ExpandedSystemUnLocodeDto })
  systemUnlocode: ExpandedSystemUnLocodeDto;

  @ApiProperty({ type: ExpandedSystemPortDto, isArray: true })
  ports: ExpandedSystemPortDto[];

  @ApiProperty({ type: ExpandedSystemProductDto, isArray: true })
  products: ExpandedSystemProductDto[];

  @ApiProperty({ type: SystemModuleDto, isArray: true })
  modules: SystemModuleDto[];

  @ApiProperty({ type: SystemSubSystemDto, isArray: true })
  subSystems: SystemSubSystemDto[];

  @ApiProperty({ type: SystemExternalInterfaceDto, isArray: true })
  externalInterfaces: SystemExternalInterfaceDto[];

  @ApiProperty({ type: SystemPersonDto, isArray: true })
  people: SystemPersonDto[];

  @ApiProperty({ type: ExpandedSystemDocumentDto, isArray: true })
  documents: ExpandedSystemDocumentDto[];
}

export class SystemListResponseDto {
  @ApiProperty({ type: ExpandedSystemDto, isArray: true })
  data: ExpandedSystemDto[];

  @ApiProperty({ description: 'Total number of systems matching the filters, ignoring paging' })
  total: number;
}
