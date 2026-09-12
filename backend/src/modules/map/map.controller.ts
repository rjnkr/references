import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MapReferencePointFeatureCollectionDto } from './dto/map-reference-point-geojson.dto';
import { MapReferencePointDto } from './dto/map-reference-point.dto';
import { MapService } from './map.service';

@Controller('map')
@ApiTags('Map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get('reference-points')
  @ApiOperation({
    summary: 'Map markers: systems grouped by the port they are linked to',
    description:
      'Returns one entry per UN/LOCODE that has both coordinates set and at least one linked ' +
      'system. Locations without coordinates or without systems are skipped.',
  })
  @ApiOkResponse({ type: MapReferencePointDto, isArray: true })
  findReferencePoints(): Promise<MapReferencePointDto[]> {
    return this.mapService.findReferencePoints();
  }

  @Get('reference-points/geojson')
  @ApiOperation({
    summary: 'The same reference points as a standard GeoJSON FeatureCollection',
    description:
      'RFC 7946 GeoJSON, in the spirit of OGC API - Features, for external GIS tools ' +
      '(QGIS "Add Vector Layer from URL", ArcGIS Online, geojson.io, ...) rather than this ' +
      "app's own map UI.",
  })
  @ApiOkResponse({ type: MapReferencePointFeatureCollectionDto })
  findReferencePointsAsGeoJson(): Promise<MapReferencePointFeatureCollectionDto> {
    return this.mapService.findReferencePointsAsGeoJson();
  }
}
