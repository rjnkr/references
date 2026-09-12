import { ApiProperty } from '@nestjs/swagger';
import { MapPointKind, MapReferenceSystemDto } from './map-reference-point.dto';
import { CountryDto } from '../../../generated/nestjs-dto/country.dto';

/**
 * RFC 7946 GeoJSON shape for `GET /api/map/reference-points/geojson` — the same data as
 * `GET /api/map/reference-points`, reshaped as a standard `FeatureCollection` so any
 * GIS client (QGIS "Add Vector Layer from URL", ArcGIS Online, geojson.io, ...) can
 * consume it directly, in the spirit of OGC API - Features.
 */
export class MapReferencePointPropertiesDto {
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

  @ApiProperty({ type: CountryDto, nullable: true })
  country: CountryDto | null;

  @ApiProperty({
    type: MapReferenceSystemDto,
    isArray: true,
    description: 'Systems linked to this location. Never empty.',
  })
  systems: MapReferenceSystemDto[];
}

export class MapReferencePointGeometryDto {
  @ApiProperty({ enum: ['Point'] })
  type: 'Point';

  @ApiProperty({
    type: 'number',
    isArray: true,
    example: [4.47917, 51.9225],
    description: '[longitude, latitude] in WGS84 decimal degrees, per RFC 7946.',
  })
  coordinates: [number, number];
}

export class MapReferencePointFeatureDto {
  @ApiProperty({ enum: ['Feature'] })
  type: 'Feature';

  @ApiProperty({ type: MapReferencePointGeometryDto })
  geometry: MapReferencePointGeometryDto;

  @ApiProperty({ type: MapReferencePointPropertiesDto })
  properties: MapReferencePointPropertiesDto;
}

export class MapReferencePointFeatureCollectionDto {
  @ApiProperty({ enum: ['FeatureCollection'] })
  type: 'FeatureCollection';

  @ApiProperty({ type: MapReferencePointFeatureDto, isArray: true })
  features: MapReferencePointFeatureDto[];
}
