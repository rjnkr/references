import { Injectable, signal } from '@angular/core';

const LIGHT_THEME_STORAGE_KEY = 'tidalis.worldMap.lightTheme';
const DARK_THEME_STORAGE_KEY = 'tidalis.worldMap.darkTheme';

/**
 * Per-browser preference for which named map colour theme (fetched live from the tile
 * server's own style catalog - see `map-theme-catalog.ts`) the world map uses while in
 * light mode vs. dark mode. `null` means "no choice made yet"; the page then falls back
 * to its own defaults. Same pattern as `TimezonePreferenceService` and the map's own
 * dark/light-mode and "show locations" preferences.
 */
@Injectable({ providedIn: 'root' })
export class MapThemePreferenceService {
  readonly lightThemeId = signal<string | null>(this.restore(LIGHT_THEME_STORAGE_KEY));
  readonly darkThemeId = signal<string | null>(this.restore(DARK_THEME_STORAGE_KEY));

  setLightTheme(id: string): void {
    this.lightThemeId.set(id);
    this.persist(LIGHT_THEME_STORAGE_KEY, id);
  }

  setDarkTheme(id: string): void {
    this.darkThemeId.set(id);
    this.persist(DARK_THEME_STORAGE_KEY, id);
  }

  private persist(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Private browsing / storage disabled — the choice just will not persist.
    }
  }

  private restore(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
}
