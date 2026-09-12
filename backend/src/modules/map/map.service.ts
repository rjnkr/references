import { Injectable } from '@nestjs/common';
import { DbService } from '../../database/db-service/db.service';
import { MapReferencePointFeatureCollectionDto } from './dto/map-reference-point-geojson.dto';
import { MapReferencePointDto } from './dto/map-reference-point.dto';

/** Kept in one place since both queries below select the identical system shape. */
const SYSTEM_SUMMARY_SELECT = {
  id: true,
  name: true,
  projectType: true,
  countryId: true,
} as const;

@Injectable()
export class MapService {
  constructor(private readonly db: DbService) {}

  /**
   * Two independent layers, told apart by `kind` - see the DTO comment.
   *
   * No `isSensitive` / `canBeUsedAsReference` filtering: this is the same data an
   * authenticated user already gets from /api/systems, only re-shaped for plotting.
   * Which systems actually get *drawn* on the map is now a per-user, client-local
   * decision (see `MapSelectionService` on the frontend) - the backend always returns
   * every non-deleted system's point.
   */
  async findReferencePoints(): Promise<MapReferencePointDto[]> {
    const [main, location] = await Promise.all([this.findSystemPoints(), this.findLocationPoints()]);

    return [...main, ...location];
  }

  /**
   * The same data as {@link findReferencePoints}, reshaped as a standard RFC 7946
   * `FeatureCollection` — for external GIS tools (QGIS, ArcGIS Online, geojson.io, ...)
   * rather than this app's own map UI.
   */
  async findReferencePointsAsGeoJson(): Promise<MapReferencePointFeatureCollectionDto> {
    const points = await this.findReferencePoints();

    return {
      type: 'FeatureCollection',
      features: points.map(({ latitude, longitude, ...properties }) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [longitude, latitude] },
        properties,
      })),
    };
  }

  /** One entry per UN/LOCODE that at least one system uses as its own location. */
  private async findSystemPoints(): Promise<MapReferencePointDto[]> {
    const unlocodes = await this.db.unLocode.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
        systems: { some: { deleted: false } },
      },
      include: {
        country: true,
        systems: {
          where: { deleted: false },
          select: { ...SYSTEM_SUMMARY_SELECT, systemUnlocodeId: true, ports: { select: { unlocodeId: true } } },
        },
      },
      orderBy: [{ code: 'asc' }],
    });

    return unlocodes.map((unlocode) => ({
      kind: 'main' as const,
      unlocodeId: unlocode.id,
      code: unlocode.code,
      name: unlocode.name,
      // Narrowed by the `not: null` filters above; Prisma still types them as
      // nullable, hence the non-null assertions.
      latitude: unlocode.latitude!,
      longitude: unlocode.longitude!,
      country: unlocode.country,
      systems: unlocode.systems.map(({ systemUnlocodeId, ports, ...summary }) => ({
        ...summary,
        hasPorts: ports.some((port) => port.unlocodeId !== systemUnlocodeId),
      })),
    }));
  }

  /**
   * One entry per UN/LOCODE that at least one system references as a port - except a
   * system whose *own location* is that same UN/LOCODE and which has no other, genuinely
   * different port: that system's "main" marker already covers it there (it stays
   * visible - see `hasPorts` on the frontend), so listing it again here would just
   * duplicate it. But when that same system *does* have another, different port
   * elsewhere, its main marker is hidden everywhere in favour of the port layer - so this
   * self-matching port is then the only marker left standing for this location, and must
   * not be dropped, or the location would show nothing at all.
   * A location left with no systems after that filtering is dropped entirely.
   */
  private async findLocationPoints(): Promise<MapReferencePointDto[]> {
    const unlocodes = await this.db.unLocode.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
        systemPorts: { some: { system: { deleted: false } } },
      },
      include: {
        country: true,
        systemPorts: {
          where: { system: { deleted: false } },
          include: {
            system: {
              select: {
                ...SYSTEM_SUMMARY_SELECT,
                systemUnlocodeId: true,
                ports: { select: { unlocodeId: true } },
              },
            },
          },
        },
      },
      orderBy: [{ code: 'asc' }],
    });

    return unlocodes
      .map((unlocode) => {
        const systems = unlocode.systemPorts
          .map((systemPort) => systemPort.system)
          .filter((system) => {
            const isOwnLocation = system.systemUnlocodeId === unlocode.id;
            const hasPorts = system.ports.some((port) => port.unlocodeId !== system.systemUnlocodeId);
            return !isOwnLocation || hasPorts;
          })
          .map(({ systemUnlocodeId: _systemUnlocodeId, ports: _ports, ...summary }) => ({
            ...summary,
            hasPorts: true,
          }));

        if (systems.length === 0) {
          return null;
        }

        const point: MapReferencePointDto = {
          kind: 'location',
          unlocodeId: unlocode.id,
          code: unlocode.code,
          name: unlocode.name,
          latitude: unlocode.latitude!,
          longitude: unlocode.longitude!,
          country: unlocode.country,
          systems,
        };
        return point;
      })
      .filter((point): point is MapReferencePointDto => point !== null);
  }
}
