import { ApiProperty } from '@nestjs/swagger';
import { ProjectType } from '@prisma/client';
import { CountryDto } from '../../../generated/nestjs-dto/country.dto';

/**
 * Swagger description of the flattened shape the world map consumes: one
 * marker per UN/LOCODE, with the systems linked to it inlined. The
 * `SystemPort` join rows are deliberately not exposed.
 *
 * Two independent layers are returned in one list, told apart by `kind`:
 * `'main'` groups systems by `System.systemUnlocodeId` (the system's own
 * location - at most one per system), `'location'` groups them by the
 * existing `SystemPort` links (a system can have many). A system is never
 * listed under `'location'` for the same UN/LOCODE as its own `'main'` marker -
 * that would just duplicate it - so the same `unlocodeId` can still appear as
 * both kinds, but never for the same system.
 */
export type MapPointKind = 'main' | 'location';

export class MapReferenceSystemDto {
  @ApiProperty({ type: 'integer', format: 'int32' })
  id: number;

  @ApiProperty({ example: 'Rotterdam VTS Upgrade' })
  name: string;

  @ApiProperty({ enum: ProjectType, enumName: 'ProjectType' })
  projectType: ProjectType;

  @ApiProperty({ type: 'integer', format: 'int32' })
  countryId: number;

  @ApiProperty({
    description:
      'Whether this system references at least one port (SystemPort) besides its own ' +
      "location. Only meaningful on a 'main' point — lets clients hide a system's own " +
      "location marker in favour of its port marker(s) when both are shown; always true " +
      "on a 'location' point, by construction.",
  })
  hasPorts: boolean;
}

export class MapReferencePointDto {
  @ApiProperty({
    enum: ['main', 'location'],
    description:
      "'main': the system's own location (System.systemUnlocodeId). " +
      "'location': a port the system additionally references (SystemPort).",
  })
  kind: MapPointKind;

  @ApiProperty({ type: 'integer', format: 'int32', description: 'UnLocode.id' })
  unlocodeId: number;

  @ApiProperty({ example: 'NLRTM', description: 'UN/LOCODE' })
  code: string;

  @ApiProperty({ example: 'Rotterdam', description: 'Location name' })
  name: string;

  @ApiProperty({
    type: 'number',
    format: 'float',
    example: 51.9225,
    description: 'WGS84 latitude in decimal degrees',
  })
  latitude: number;

  @ApiProperty({
    type: 'number',
    format: 'float',
    example: 4.47917,
    description: 'WGS84 longitude in decimal degrees',
  })
  longitude: number;

  @ApiProperty({ type: CountryDto, nullable: true })
  country: CountryDto | null;

  @ApiProperty({
    type: MapReferenceSystemDto,
    isArray: true,
    description: 'Systems linked to this location. Never empty.',
  })
  systems: MapReferenceSystemDto[];
}
