import { ProjectType } from './project.models';

/* ====================================================================================
 * World-map types — mirrors `GET /api/map/reference-points`.
 *
 * Two independent layers come back in one list, told apart by `kind`: `'main'` groups
 * systems by their own location (at most one per system); `'location'` groups them by the
 * ports they additionally reference (a system can have many). The same `unlocodeId` can
 * legitimately appear once per kind. Within a kind, `systems` holds every system reference
 * recorded at that point — an entry with `systems.length > 1` *is* the cluster: there is no
 * client-side clustering to do.
 * ================================================================================== */

/** Which of the two map layers a point belongs to. */
export type MapPointKind = 'main' | 'location';

/** Slim system summary carried on a map point — enough to label and open it. */
export interface MapSystemSummary {
  id: number;
  name: string;
  projectType: ProjectType;
  countryId: number;
  /** Whether this system references at least one port besides its own location. Only
   *  meaningful on a `'main'` point — always `true` on a `'location'` point. */
  hasPorts: boolean;
}

/** Country stub attached to a map point (null when the UN/LOCODE has no country). */
export interface MapPointCountry {
  id: number;
  isoCode: string;
  name: string;
}

/** One physical location (a UN/LOCODE port) plus the references recorded there. */
export interface MapReferencePoint {
  kind: MapPointKind;
  unlocodeId: number;
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  country: MapPointCountry | null;
  systems: MapSystemSummary[];
}
