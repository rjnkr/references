import { Injectable } from '@angular/core';

const HIDDEN_SYSTEM_IDS_STORAGE_KEY = 'tidalis.map.hiddenSystemIds';

/**
 * Per-user, per-browser "which systems do I want on my World Map" preference — see the
 * `MapSelectionService` note in the plan this was built from: multiple people use this
 * app at once, so this is deliberately NOT the old shared `System.showOnMap` database
 * column (removed) — it lives only in this browser's `localStorage`, same pattern as the
 * map's theme/"show locations" preferences in `world-map-page.component.ts`.
 *
 * Stores the set of systems a user has *hidden*, not the set they've shown: an empty (or
 * inaccessible, e.g. private browsing) set means "show everything", so a brand new user -
 * or a brand new system nobody has hidden yet - is visible by default with no special
 * casing, and narrowing down is an opt-out rather than an opt-in.
 */
@Injectable({ providedIn: 'root' })
export class MapSelectionService {
  private hiddenIds = this.restoreHiddenIds();

  isShown(systemId: number): boolean {
    return !this.hiddenIds.has(systemId);
  }

  setShown(systemId: number, shown: boolean): void {
    if (shown) {
      this.hiddenIds.delete(systemId);
    } else {
      this.hiddenIds.add(systemId);
    }
    this.persist();
  }

  setManyShown(systemIds: readonly number[], shown: boolean): void {
    for (const id of systemIds) {
      if (shown) {
        this.hiddenIds.delete(id);
      } else {
        this.hiddenIds.add(id);
      }
    }
    this.persist();
  }

  private restoreHiddenIds(): Set<number> {
    try {
      const raw = localStorage.getItem(HIDDEN_SYSTEM_IDS_STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(parsed) ? parsed.filter((id): id is number => typeof id === 'number') : []);
    } catch {
      return new Set();
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(HIDDEN_SYSTEM_IDS_STORAGE_KEY, JSON.stringify([...this.hiddenIds]));
    } catch {
      // Private browsing / storage disabled — the choice just will not persist.
    }
  }
}
