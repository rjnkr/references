import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import View from 'ol/View';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import type { Pixel } from 'ol/pixel';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style';
import { apply as applyMapboxStyle } from 'ol-mapbox-style';

import { environment } from '../../../environments/environment';
import { LookupService } from '../../core/api/lookup.service';
import { MapService } from '../../core/api/map.service';
import { MapReferencePoint, MapSystemSummary } from '../../core/models/map.models';
import { System } from '../../core/models/system.models';
import { MapSelectionService } from '../../core/services/map-selection.service';
import { MapThemePreferenceService } from '../../core/services/map-theme-preference.service';
import { SystemService } from '../../core/api/system.service';
import { MapThemeOption, fetchMapThemeCatalog, themeLabelFor } from './map-theme-catalog';
import { MapSystemDialogComponent, MapSystemDialogData } from './map-system-dialog.component';

/* ====================================================================================
 * World map, on OpenLayers.
 *
 * The base map is Tidalis's own TileServer GL instance (mcsse-ext-maps.tidalis.com) — a
 * vector-tile server exposing MapLibre/Mapbox GL Style Spec v8 documents, rendered here
 * with `ol-mapbox-style`. It ships matching "light"/"dark" styles, which now drive the
 * theme toggle directly (swapping the real base map, not just a CSS filter), and carries
 * a full OSM-based base layer plus Tidalis's own nautical chart overlays for free.
 *
 * OpenLayers was chosen specifically for its native OGC WMS/WFS client support
 * (`ol/source/TileWMS`, `ol/source/ImageWMS`, `ol/format/WFS`) — none is wired up today
 * (no live WMS/WFS endpoint was available this round), but adding one later is a single
 * extra `TileLayer`/`VectorLayer`, independent of everything below.
 *
 * Reference-point markers are a canvas-rendered `VectorLayer` (constant-pixel-size dots,
 * exactly like the old D3 SVG version's `scale(1/k)` counter-trick — OpenLayers' `Circle`
 * style is already defined in screen pixels, not map units, so no extra work is needed to
 * keep dot size constant across zoom levels). Canvas can't do CSS `:hover`/`:active` or
 * per-node transitions, so the "expand a cluster's satellites on hover" interaction — kept
 * deliberately, see `SatelliteDatum` below — is instead a handful of absolutely-positioned
 * DOM elements (`.map-point__satellite`, positioned via `map.getPixelFromCoordinate()`),
 * reusing the exact same CSS this screen already had for them.
 * ================================================================================== */

/** Screen-space radius of the satellite circles an expanded cluster fans out into. */
const SATELLITE_RADIUS = 6.5;

/** Screen-space radius of a marker for a location with exactly one reference. */
const DOT_RADIUS = 6;

/** Screen-space radius of a cluster's hub dot — visibly larger than a lone reference. */
const CLUSTER_DOT_RADIUS = 9;

/** Where the light/dark preference for this screen is remembered between visits. */
const THEME_STORAGE_KEY = 'tidalis.worldMap.theme';

/** Themes used when nothing has been picked yet (or the picked one no longer exists in
 *  the tile server's catalog) - the same two styles this screen always used before named
 *  themes were selectable. */
const DEFAULT_LIGHT_THEME_ID = 'ecdis-day';
const DEFAULT_DARK_THEME_ID = 'ecdis-day-black-back';

/** Used only if `GET {tileBaseUrl}/styles.json` itself fails (network/CORS/service
 *  outage) - lets the map still come up with the two original defaults rather than
 *  showing nothing at all. */
function fallbackThemeCatalog(tileBaseUrl: string): MapThemeOption[] {
  return [DEFAULT_LIGHT_THEME_ID, DEFAULT_DARK_THEME_ID].map((id) => ({
    id,
    label: themeLabelFor(id),
    styleUrl: `${tileBaseUrl}/styles/${id}/style.json`,
  }));
}

/** Where the "also show location UN/LOCODEs" preference is remembered between visits. */
const SHOW_LOCATIONS_STORAGE_KEY = 'tidalis.worldMap.showLocations';

/** Padding (screen pixels) kept around the data extent when first fitting the view. */
const FIT_PADDING = 48;

/* --- View-model -------------------------------------------------------------------- */

interface SatelliteDatum {
  system: MapSystemSummary;
  /** Offset from the cluster hub, in screen pixels. */
  dx: number;
  dy: number;
  title: string;
  subtitle: string;
}

interface PointDatum {
  point: MapReferencePoint;
  lonLat: [number, number];
  r: number;
  ring: number;
  satellites: SatelliteDatum[];
  title: string;
  subtitle: string;
  /** Number of references combined into this dot; shown as a label once it exceeds 1. */
  count: number;
  /** Set only when the location holds exactly one reference (i.e. directly clickable). */
  systemId: number | null;
  /** `${kind}:${unlocodeId}` — the same UN/LOCODE can appear once per kind. */
  key: string;
}

/** Colours read once from the CSS custom properties on `.map-shell` (see the .scss file)
 *  so the canvas-rendered dots stay in sync with the theme without hard-coding hex here. */
interface MarkerPalette {
  main: string;
  mainHover: string;
  /** Always a thin, very light green — the same for a lone dot and a cluster hub, in
   *  both themes. */
  markerStroke: string;
  location: string;
  locationHover: string;
  locationStroke: string;
  countText: string;
}

/** One entry of a MapLibre/Mapbox GL Style Spec v8 document's `layers` array — only the
 *  fields `filterToBaseAndWater()` below actually inspects. */
interface MapboxStyleLayer {
  type: string;
  source?: string;
  'source-layer'?: string;
}

/**
 * Trims a mcsse-ext-maps style document down to just its base map: the `background`
 * layer and the OSM `water` fill. Dropped entirely are the `displaybase`/`standard`/
 * `other` sources — Tidalis's nautical (IHO S-52 ENC) chart data — and the rest of the
 * general OSM basemap (roads, buildings, places, admin boundaries, ...).
 *
 * Nautical charts are switched off completely here, not just thinned down to "Display
 * Base": even that minimum ENC layer set was dense enough to render as a solid dark
 * patch whichever coverage area the data has (Northern Europe in this dataset) — see the
 * Netherlands on the map before vs. after this change.
 */
function filterToBaseAndWater(style: { layers?: MapboxStyleLayer[] }): typeof style {
  const layers = (style.layers ?? []).filter(
    (layer) => layer.type === 'background' || (layer.source === 'openmaptiles' && layer['source-layer'] === 'water'),
  );
  return { ...style, layers };
}

@Component({
  selector: 'app-world-map-page',
  imports: [MatIconModule, MatMenuModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './world-map-page.component.html',
  styleUrl: './world-map-page.component.scss',
})
export class WorldMapPageComponent implements AfterViewInit, OnDestroy {
  private readonly zone = inject(NgZone);
  private readonly api = inject(MapService);
  private readonly systems = inject(SystemService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  private readonly lookups = inject(LookupService);
  private readonly mapSelection = inject(MapSelectionService);
  private readonly themePreference = inject(MapThemePreferenceService);

  @ViewChild('shell', { static: true }) private shell!: ElementRef<HTMLDivElement>;
  @ViewChild('mapTarget', { static: true }) private mapTarget!: ElementRef<HTMLDivElement>;
  @ViewChild('satellitesLayer', { static: true }) private satellitesLayer!: ElementRef<HTMLDivElement>;
  @ViewChild('tooltip', { static: true }) private tooltip!: ElementRef<HTMLDivElement>;
  @ViewChild('tooltipTitle', { static: true }) private tooltipTitle!: ElementRef<HTMLElement>;
  @ViewChild('tooltipSub', { static: true }) private tooltipSub!: ElementRef<HTMLElement>;

  /* --- Angular-facing state (the only things that touch change detection) ---------- */

  protected readonly loading = signal(true);
  protected readonly loadFailed = signal(false);
  /** Drives only the "no systems selected for display" empty state — not shown in the UI. */
  protected readonly locationCount = signal(0);
  /** Defaults to the original dark navy look; remembered per browser once toggled. */
  protected readonly darkMode = signal(true);
  /** True while `.map-shell` owns the browser's native Fullscreen API. */
  protected readonly isFullscreen = signal(false);
  /** Location (port) markers are opt-in — only the system/"main" markers show by default. */
  protected readonly showLocations = signal(false);
  /** Named colour themes offered by the tile server, fetched once on init; empty until
   *  `loadThemeCatalog()` resolves. */
  protected readonly themes = signal<MapThemeOption[]>([]);
  /** Which of `themes()` is used while the map is in light mode / dark mode. Resolved
   *  once the catalog loads (see `resolveThemeId`); the defaults here only matter for the
   *  brief window before that first resolves. */
  protected readonly lightThemeId = signal(DEFAULT_LIGHT_THEME_ID);
  protected readonly darkThemeId = signal(DEFAULT_DARK_THEME_ID);
  protected readonly lightThemeLabel = computed(
    () => this.themes().find((t) => t.id === this.lightThemeId())?.label ?? this.lightThemeId(),
  );
  protected readonly darkThemeLabel = computed(
    () => this.themes().find((t) => t.id === this.darkThemeId())?.label ?? this.darkThemeId(),
  );

  /* --- OpenLayers state (never read from the template) ------------------------------ */

  private map?: Map;
  private markerSource = new VectorSource<Feature<Point>>();
  private markerLayer?: VectorLayer<VectorSource<Feature<Point>>>;
  private palette: MarkerPalette = this.readPalette();

  private data: PointDatum[] = [];
  /** Everything the API returned (main + location), cached so toggling `showLocations`
   *  can re-render without a round-trip. */
  private allPoints: MapReferencePoint[] = [];
  private hasFittedView = false;
  private resizeObserver?: ResizeObserver;
  private resizeFrame = 0;
  private pendingSystemId: number | null = null;

  /** Key of the currently fanned-out cluster, if any (see `updateExpandedCluster`). */
  private expandedKey: string | null = null;
  private hoveredKey: string | null = null;

  // Bound once so it can be added and removed from `document` with the same reference.
  // Fires for Esc too — that's the native Fullscreen API, no separate keydown handler needed.
  // Registered outside Angular's zone (see ngAfterViewInit), so the signal write is hopped
  // back into the zone explicitly — the controls/exit-button `@if`s depend on it re-rendering.
  private readonly onFullscreenChange = (): void => {
    this.zone.run(() => this.isFullscreen.set(!!document.fullscreenElement));
  };

  /* --- Lifecycle -------------------------------------------------------------------- */

  constructor() {
    // The reused detail panel renders its country/document-type dropdowns from the cached
    // lookup signals, which the list page normally primes. Warm them here so the
    // click-to-detail overlay is complete the moment it opens.
    this.lookups.preload().subscribe({ error: () => undefined });
    this.darkMode.set(this.restoreDarkMode());
    this.showLocations.set(this.restoreShowLocations());
  }

  ngAfterViewInit(): void {
    // Everything below hangs event listeners (pointer move/click, resize) off the DOM.
    // Building it outside Angular's zone keeps those hot paths fromCreate scheduling change
    // detection; we hop back in only to open the detail dialog.
    this.zone.runOutsideAngular(() => {
      this.loadThemeCatalog();
      this.observeResize();
      document.addEventListener('fullscreenchange', this.onFullscreenChange);
    });

    this.load();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    if (this.resizeFrame) {
      cancelAnimationFrame(this.resizeFrame);
    }
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
    this.map?.setTarget(undefined);
    if (document.fullscreenElement === this.shell?.nativeElement) {
      document.exitFullscreen().catch(() => undefined);
    }
  }

  /* --- Data ------------------------------------------------------------------------ */

  private load(): void {
    this.loading.set(true);
    this.loadFailed.set(false);

    this.api.referencePoints().subscribe({
      next: (points) => {
        this.loading.set(false);
        this.locationCount.set(points.length);
        this.allPoints = points;
        this.zone.runOutsideAngular(() => this.refresh());
      },
      error: () => {
        // A 401 is already handled globally by `authErrorInterceptor` (redirect to
        // /login); anything else just gets a quiet inline message over the map.
        this.loading.set(false);
        this.loadFailed.set(true);
      },
    });
  }

  /** Rebuilds and re-renders from the cached `allPoints` — no API call. Used both after a
   *  fresh load and when `showLocations` is toggled. Must run outside Angular's zone. */
  private refresh(): void {
    this.buildData(this.allPoints);
    this.renderPoints();
    this.fitViewToDataOnce();
  }

  private buildData(points: MapReferencePoint[]): void {
    this.data = [];

    for (const point of points) {
      // Which systems this particular user wants shown — a per-browser preference
      // (`MapSelectionService`), not anything the backend filters on anymore. A point
      // left with none after this is dropped entirely, same as the backend already does
      // when a "location" point loses its last system.
      const systems = point.systems.filter((system) => {
        if (!this.mapSelection.isShown(system.id)) {
          return false;
        }
        // Once port markers are switched on, a system with its own ports already has a
        // marker there — showing its system-location marker too would just duplicate it.
        // A system with no ports keeps showing its system-location marker regardless.
        if (point.kind === 'main' && this.showLocations() && system.hasPorts) {
          return false;
        }
        return true;
      });
      const count = systems.length;
      if (count === 0) {
        continue;
      }

      const place = [point.name, point.country?.name].filter(Boolean).join(', ');
      const isCluster = count > 1;

      // Grow the ring only once the default 20 px would crowd the satellites together,
      // so the common 2–8 reference cluster always fans out to the same tidy size.
      const ring = isCluster
        ? Math.min(46, Math.max(20, (count * 15) / (2 * Math.PI)))
        : 0;

      const satellites: SatelliteDatum[] = isCluster
        ? systems.map((system, index) => {
            const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
            return {
              system,
              dx: ring * Math.cos(angle),
              dy: ring * Math.sin(angle),
              title: system.name,
              subtitle: place,
            };
          })
        : [];

      this.data.push({
        point,
        lonLat: [point.longitude, point.latitude],
        // A cluster's hub dot is a clear step up from a lone reference, then grows
        // gently with the count instead of ballooning — the number inside stays legible.
        r: isCluster ? Math.min(14, CLUSTER_DOT_RADIUS + Math.min(count - 2, 5)) : DOT_RADIUS,
        ring,
        satellites,
        title: isCluster ? place : systems[0].name,
        subtitle: isCluster ? `${count} system references — hover to fan out` : place,
        count,
        systemId: isCluster ? null : systems[0].id,
        key: `${point.kind}:${point.unlocodeId}`,
      });
    }
  }

  /* --- Map scaffolding --------------------------------------------------------------- */

  /** Fetches the tile server's style catalog once, resolves this browser's remembered
   *  light/dark theme choices against it (falling back to the two long-standing
   *  defaults if a choice is missing or no longer offered), then builds the map. Must run
   *  outside Angular's zone (see `ngAfterViewInit`); the signal writes here feed the
   *  theme-picker menu in the template, so they're hopped back into the zone. */
  private loadThemeCatalog(): void {
    fetchMapThemeCatalog(environment.worldMap.tileBaseUrl)
      .catch(() => fallbackThemeCatalog(environment.worldMap.tileBaseUrl))
      .then((themes) => {
        this.zone.run(() => {
          this.themes.set(themes);
          this.lightThemeId.set(this.resolveThemeId(themes, this.themePreference.lightThemeId(), DEFAULT_LIGHT_THEME_ID));
          this.darkThemeId.set(this.resolveThemeId(themes, this.themePreference.darkThemeId(), DEFAULT_DARK_THEME_ID));
        });
        this.initMap();
      });
  }

  private resolveThemeId(themes: MapThemeOption[], storedId: string | null, defaultId: string): string {
    const ids = new Set(themes.map((theme) => theme.id));
    if (storedId && ids.has(storedId)) {
      return storedId;
    }
    if (ids.has(defaultId)) {
      return defaultId;
    }
    return themes[0]?.id ?? defaultId;
  }

  private currentStyleUrl(): string {
    const id = this.darkMode() ? this.darkThemeId() : this.lightThemeId();
    const theme = this.themes().find((t) => t.id === id) ?? this.themes()[0];
    return theme?.styleUrl ?? `${environment.worldMap.tileBaseUrl}/styles/${id}/style.json`;
  }

  private initMap(): void {
    const styleUrl = this.currentStyleUrl();

    this.markerLayer = new VectorLayer({
      source: this.markerSource,
      style: (feature) => this.styleForFeature(feature as Feature<Point>),
      zIndex: 10,
      updateWhileAnimating: true,
      updateWhileInteracting: true,
    });

    fetch(styleUrl)
      .then((response) => response.json())
      .then((style) => filterToBaseAndWater(style))
      .then((style) => applyMapboxStyle(this.mapTarget.nativeElement, style, { styleUrl }))
      .then((mapOrGroup) => {
        // Passing an HTMLElement (rather than an existing Map/LayerGroup) always
        // resolves with a freshly-created `Map` — the `LayerGroup` half of the return
        // type only applies when a `LayerGroup` was passed in ourselves, which we never do.
        const map = mapOrGroup as Map;
        this.map = map;
        map.addLayer(this.markerLayer!);
        map.on('pointermove', (event) => this.handlePointerMove(event.pixel));
        map.on('click', (event) => this.handleClick(event.pixel));
        map.getViewport().addEventListener('pointerleave', () => this.clearHover());
        this.fitViewToDataOnce();
      })
      .catch(() => {
        // The base map failed to load (network/CORS/service outage) — markers still
        // render on a blank canvas rather than the whole screen going empty.
        this.snackbar.open('Could not load the base map.', 'Dismiss', {
          duration: 6000,
          panelClass: 'tidalis-snackbar-error',
        });
      });
  }

  /** Fits the view to the data's own extent, once, the first time there is data to fit
   *  to — after that the user's own pan/zoom is left alone. */
  private fitViewToDataOnce(): void {
    if (this.hasFittedView || !this.map || this.data.length === 0) {
      return;
    }
    this.hasFittedView = true;

    const lons = this.data.map((d) => d.lonLat[0]);
    const lats = this.data.map((d) => d.lonLat[1]);
    const extent = [
      ...fromLonLat([Math.min(...lons), Math.min(...lats)]),
      ...fromLonLat([Math.max(...lons), Math.max(...lats)]),
    ] as [number, number, number, number];

    const view = this.map.getView();
    view.fit(extent, { padding: [FIT_PADDING, FIT_PADDING, FIT_PADDING, FIT_PADDING], maxZoom: 6 });
    // One level further out than the fit itself would choose, so a tight cluster of
    // points doesn't read as zoomed all the way in on first load.
    view.setZoom((view.getZoom() ?? 6) - 1);
  }

  private observeResize(): void {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }
    this.resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(this.resizeFrame);
      this.resizeFrame = requestAnimationFrame(() => this.map?.updateSize());
    });
    this.resizeObserver.observe(this.shell.nativeElement);
  }

  /* --- Markers ---------------------------------------------------------------------- */

  /** "main" (system) points always show; "location" (port) points are opt-in. */
  private visibleData(): PointDatum[] {
    return this.data.filter((d) => d.point.kind === 'main' || this.showLocations());
  }

  private renderPoints(): void {
    this.markerSource.clear();
    const features = this.visibleData().map((datum) => {
      const feature = new Feature({ geometry: new Point(fromLonLat(datum.lonLat)) });
      feature.set('datum', datum);
      feature.setId(datum.key);
      return feature;
    });
    this.markerSource.addFeatures(features);
    this.collapseCluster();
  }

  private styleForFeature(feature: Feature<Point>): Style {
    const datum = feature.get('datum') as PointDatum;
    // A "main" point renders with location styling too once ports are shown — by then it
    // only ever holds systems with no ports of their own (see `buildData`), standing in
    // for a port marker at that same spot, so it should look like one.
    const isLocation = datum.point.kind === 'location' || (datum.point.kind === 'main' && this.showLocations());
    const hovered = datum.key === this.hoveredKey;

    const fill = isLocation
      ? hovered
        ? this.palette.locationHover
        : this.palette.location
      : hovered
        ? this.palette.mainHover
        : this.palette.main;
    // Always thin and very light green — the same for a lone dot and a cluster hub, in
    // both themes. Location markers keep their own (fixed, cream) stroke colour.
    const stroke = isLocation ? this.palette.locationStroke : this.palette.markerStroke;

    return new Style({
      image: new CircleStyle({
        radius: datum.r,
        fill: new Fill({ color: fill }),
        stroke: new Stroke({ color: stroke, width: 0.5 }),
      }),
      text:
        datum.count > 1 && datum.point.kind === 'main'
          ? new Text({
              text: String(datum.count),
              fill: new Fill({ color: this.palette.countText }),
              font: `700 ${datum.count > 9 ? datum.r * 0.8 : datum.r * 0.95}px var(--tidalis-font, sans-serif)`,
            })
          : undefined,
    });
  }

  /** Re-styles just the two affected features rather than the whole layer, so hovering
   *  across the map does not repaint every marker on every pointer move. */
  private refreshFeatureStyle(key: string | null): void {
    if (!key) {
      return;
    }
    const feature = this.markerSource.getFeatureById(key) as Feature<Point> | null;
    feature?.changed();
  }

  /* --- Hover / cluster fan-out (DOM overlay on top of the canvas map) --------------- */

  private handlePointerMove(pixel: Pixel): void {
    const nearest = this.findNearbyPoint(pixel);

    if (nearest?.key !== this.hoveredKey) {
      const previous = this.hoveredKey;
      this.hoveredKey = nearest?.key ?? null;
      this.refreshFeatureStyle(previous);
      this.refreshFeatureStyle(this.hoveredKey);
    }

    if (nearest) {
      this.showTooltip(pixel, nearest.title, nearest.subtitle);
      this.updateExpandedCluster(nearest, pixel);
    } else {
      this.hideTooltip();
      if (!this.isPointerNearSatellite(pixel)) {
        this.collapseCluster();
      }
    }
  }

  /** The hub whose hit target (or, if already expanded, whose fan-out ring) contains the
   *  given pixel — mirrors the old SVG version's `r+6` / `ring+SATELLITE_RADIUS+10` hit
   *  targets exactly, just computed in screen space instead of via an actual DOM hit test. */
  private findNearbyPoint(pixel: Pixel): PointDatum | null {
    if (!this.map) {
      return null;
    }
    let closest: PointDatum | null = null;
    let closestDistance = Infinity;

    for (const datum of this.visibleData()) {
      const centre = this.map.getPixelFromCoordinate(fromLonLat(datum.lonLat));
      if (!centre) {
        continue;
      }
      const dx = pixel[0] - centre[0];
      const dy = pixel[1] - centre[1];
      const distance = Math.hypot(dx, dy);
      const hitRadius =
        datum.key === this.expandedKey ? datum.ring + SATELLITE_RADIUS + 10 : datum.r + 6;

      if (distance <= hitRadius && distance < closestDistance) {
        closest = datum;
        closestDistance = distance;
      }
    }

    return closest;
  }

  private isPointerNearSatellite(pixel: Pixel): boolean {
    if (!this.expandedKey || !this.map) {
      return false;
    }
    const datum = this.visibleData().find((d) => d.key === this.expandedKey);
    if (!datum) {
      return false;
    }
    const centre = this.map.getPixelFromCoordinate(fromLonLat(datum.lonLat));
    if (!centre) {
      return false;
    }
    const distance = Math.hypot(pixel[0] - centre[0], pixel[1] - centre[1]);
    return distance <= datum.ring + SATELLITE_RADIUS + 10;
  }

  private updateExpandedCluster(datum: PointDatum, pixel: Pixel): void {
    if (datum.satellites.length === 0) {
      if (this.expandedKey && this.expandedKey !== datum.key) {
        this.collapseCluster();
      }
      return;
    }
    if (this.expandedKey === datum.key) {
      return;
    }
    this.expandedKey = datum.key;
    this.renderSatellites(datum);
    void pixel;
  }

  private collapseCluster(): void {
    if (!this.expandedKey) {
      return;
    }
    this.expandedKey = null;
    this.satellitesLayer.nativeElement.replaceChildren();
  }

  private renderSatellites(datum: PointDatum): void {
    if (!this.map) {
      return;
    }
    const centre = this.map.getPixelFromCoordinate(fromLonLat(datum.lonLat));
    if (!centre) {
      return;
    }

    const container = this.satellitesLayer.nativeElement;
    container.replaceChildren();

    for (const satellite of datum.satellites) {
      const el = document.createElement('div');
      el.className = 'map-point__satellite';
      el.style.left = `${centre[0]}px`;
      el.style.top = `${centre[1]}px`;
      el.style.setProperty('--dx', `${satellite.dx}px`);
      el.style.setProperty('--dy', `${satellite.dy}px`);
      if (datum.point.kind === 'location') {
        el.classList.add('map-point__satellite--location');
      }
      el.addEventListener('mouseenter', () => this.showTooltip(null, satellite.title, satellite.subtitle, el));
      el.addEventListener('mouseleave', () => this.hideTooltip());
      el.addEventListener('click', (event) => {
        event.stopPropagation();
        this.openSystem(satellite.system.id, el);
      });
      container.appendChild(el);
      // Force layout before adding the "expanded" class so the CSS transition (0 → 1
      // scale) actually runs instead of starting already at its end state.
      requestAnimationFrame(() => el.classList.add('is-expanded'));
    }
  }

  private handleClick(pixel: Pixel): void {
    const nearest = this.findNearbyPoint(pixel);
    if (nearest?.systemId !== null && nearest?.systemId !== undefined) {
      this.openSystem(nearest.systemId, null);
    }
  }

  private clearHover(): void {
    const previous = this.hoveredKey;
    this.hoveredKey = null;
    this.refreshFeatureStyle(previous);
    this.hideTooltip();
  }

  /* --- Tooltip (driven imperatively, so hover never triggers change detection) ------ */

  private showTooltip(
    pixel: Pixel | null,
    title: string,
    subtitle: string,
    anchorEl?: HTMLElement,
  ): void {
    this.tooltipTitle.nativeElement.textContent = title;
    this.tooltipSub.nativeElement.textContent = subtitle;
    this.tooltip.nativeElement.classList.add('is-visible');

    const host = this.shell.nativeElement;
    let x: number;
    let y: number;
    if (anchorEl) {
      const hostRect = host.getBoundingClientRect();
      const elRect = anchorEl.getBoundingClientRect();
      x = elRect.left + elRect.width / 2 - hostRect.left;
      y = elRect.top - hostRect.top;
    } else if (pixel) {
      [x, y] = pixel;
    } else {
      return;
    }

    const element = this.tooltip.nativeElement;
    const half = element.offsetWidth / 2;
    const left = Math.min(Math.max(x, half + 10), host.clientWidth - half - 10);
    element.style.transform = `translate(${left}px, ${y - 16}px) translate(-50%, -100%)`;
  }

  private hideTooltip(): void {
    this.tooltip.nativeElement.classList.remove('is-visible');
  }

  /* --- Click through to the system detail -------------------------------------------- */

  private openSystem(systemId: number, marker: HTMLElement | null): void {
    if (this.pendingSystemId !== null) {
      return;
    }

    this.pendingSystemId = systemId;
    this.shell.nativeElement.classList.add('is-busy');
    marker?.classList.add('is-loading');

    // Back into Angular: the HTTP call, the dialog and everything the reused detail
    // panel does need change detection.
    this.zone.run(() => {
      this.systems.get(systemId).subscribe({
        next: (system) => {
          this.clearPending(marker);
          this.openDialog(system);
        },
        error: () => {
          this.clearPending(marker);
          this.snackbar.open('Could not load that system.', 'Dismiss', {
            duration: 6000,
            panelClass: 'tidalis-snackbar-error',
          });
        },
      });
    });
  }

  private clearPending(marker: HTMLElement | null): void {
    this.pendingSystemId = null;
    this.shell.nativeElement.classList.remove('is-busy');
    marker?.classList.remove('is-loading');
  }

  private openDialog(system: System): void {
    this.hideTooltip();

    const data: MapSystemDialogData = { system };
    this.dialog
      .open<MapSystemDialogComponent, MapSystemDialogData, boolean>(MapSystemDialogComponent, {
        data,
        width: '860px',
        maxWidth: '96vw',
        maxHeight: '90vh',
        autoFocus: false,
        panelClass: 'map-system-dialog',
      })
      .afterClosed()
      .subscribe((changed) => {
        // Something was saved or deleted from inside the overlay — the port grouping may
        // have changed, so pull the points again.
        if (changed) {
          this.load();
        }
      });
  }

  /* --- Zoom controls (template) ----------------------------------------------------- */

  protected zoomIn(): void {
    this.scaleBy(1.6);
  }

  protected zoomOut(): void {
    this.scaleBy(1 / 1.6);
  }

  private scaleBy(factor: number): void {
    const view = this.map?.getView();
    if (!view) {
      return;
    }
    const zoom = view.getZoom() ?? 2;
    this.zone.runOutsideAngular(() => {
      view.animate({ zoom: zoom + Math.log2(factor), duration: 220 });
    });
  }

  protected retry(): void {
    this.load();
  }

  /* --- Full screen (template) --------------------------------------------------------
   * Native Fullscreen API on `.map-shell` itself — the whole app chrome (navbar, footer,
   * padding) drops away with it, leaving just the map for a clean screenshot. The
   * existing ResizeObserver already calls `map.updateSize()` on the resize this causes. */

  protected enterFullscreen(): void {
    this.shell.nativeElement.requestFullscreen().catch(() => undefined);
  }

  protected exitFullscreen(): void {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
    }
  }

  /* --- Light/dark toggle (template) --------------------------------------------------
   * Swaps the actual base map (mcsse-ext-maps ships matching "light"/"dark" styles),
   * not just a CSS filter over the same tiles — simplest robust way to do that with
   * `ol-mapbox-style` is to tear down and rebuild the whole map, since toggling is a
   * rare, deliberate user action, not a hot path. */

  protected toggleTheme(): void {
    const next = !this.darkMode();
    this.darkMode.set(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
    } catch {
      // Private browsing / storage disabled — the choice just will not persist.
    }
    this.rebuildMap();
  }

  private restoreDarkMode(): boolean {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) !== 'light';
    } catch {
      return true;
    }
  }

  /* --- Named theme picker (template) -------------------------------------------------
   * Two independent choices - which named tile-server style is used while in light mode,
   * and while in dark mode - mirroring the "Light/Dark Color Theme" pickers in Tidalis's
   * own Traffic Viewer. Picking a theme for the mode that isn't currently active just
   * remembers it for next time; only a change to the *active* mode's theme rebuilds the
   * map immediately. */

  protected selectLightTheme(id: string): void {
    this.lightThemeId.set(id);
    this.themePreference.setLightTheme(id);
    if (!this.darkMode()) {
      this.rebuildMap();
    }
  }

  protected selectDarkTheme(id: string): void {
    this.darkThemeId.set(id);
    this.themePreference.setDarkTheme(id);
    if (this.darkMode()) {
      this.rebuildMap();
    }
  }

  /** Tears down and rebuilds the whole OpenLayers map against whichever style
   *  `currentStyleUrl()` now resolves to, keeping the current pan/zoom - the simplest
   *  robust way to swap the live `ol-mapbox-style` base layer for a different style
   *  document. Shared by the dark/light toggle and both named-theme pickers. */
  private rebuildMap(): void {
    this.palette = this.readPalette();
    this.zone.runOutsideAngular(() => {
      const previousView = this.map?.getView();
      const center = previousView?.getCenter();
      const zoom = previousView?.getZoom();
      this.map?.setTarget(undefined);
      this.hasFittedView = true; // keep the current view instead of re-fitting to data
      this.initMap();
      if (center !== undefined && zoom !== undefined) {
        // `initMap` resolves asynchronously; restore the view once it's ready.
        const restore = () => {
          const view = this.map?.getView();
          if (view) {
            view.setCenter(center);
            view.setZoom(zoom);
          } else {
            requestAnimationFrame(restore);
          }
        };
        requestAnimationFrame(restore);
      }
      this.renderPoints();
    });
  }

  private readPalette(): MarkerPalette {
    const read = (name: string, fallback: string): string => {
      if (typeof getComputedStyle === 'undefined' || !this.shell) {
        return fallback;
      }
      const value = getComputedStyle(this.shell.nativeElement).getPropertyValue(name).trim();
      return value || fallback;
    };
    return {
      main: read('--map-point-strong', '#2f8f52'),
      mainHover: read('--map-point-hover-fill', '#3fae66'),
      markerStroke: read('--map-marker-stroke', '#d7f7e0'),
      location: read('--map-point-location', '#f8e7c4'),
      locationHover: read('--map-point-location-hover-fill', '#fbf1dc'),
      locationStroke: read('--map-point-location-stroke', 'rgba(122, 90, 40, 0.6)'),
      countText: read('--map-count-text', '#ffffff'),
    };
  }

  /* --- Main / all-locations toggle (template) ---------------------------------------- */

  protected toggleLocations(): void {
    const next = !this.showLocations();
    this.showLocations.set(next);
    try {
      localStorage.setItem(SHOW_LOCATIONS_STORAGE_KEY, next ? 'true' : 'false');
    } catch {
      // Private browsing / storage disabled — the choice just will not persist.
    }
    // Rebuild from the already-fetched data; no need to hit the API again. A rebuild (not
    // just a re-render) is required because `buildData` itself depends on `showLocations`
    // now — it decides whether a system's own location marker is hidden in favour of its
    // port marker(s).
    this.zone.runOutsideAngular(() => {
      this.buildData(this.allPoints);
      this.renderPoints();
    });
  }

  private restoreShowLocations(): boolean {
    try {
      return localStorage.getItem(SHOW_LOCATIONS_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }
}
