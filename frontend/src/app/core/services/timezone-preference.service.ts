import { Injectable, signal } from '@angular/core';

const SHOW_UTC_STORAGE_KEY = 'tidalis.auditLog.showUtc';

/**
 * Per-browser preference for how the Audit Trail displays its timestamps. Reviewers are
 * not all in the same timezone, so the default is each viewer's own local time (what
 * `Date`/`DatePipe` show with no explicit timezone); switching to UTC is opt-in and
 * remembered in this browser only, same pattern as the map's theme/"show locations"
 * preferences.
 */
@Injectable({ providedIn: 'root' })
export class TimezonePreferenceService {
  readonly showUtc = signal<boolean>(this.restore());

  toggle(): void {
    this.setShowUtc(!this.showUtc());
  }

  setShowUtc(value: boolean): void {
    this.showUtc.set(value);
    try {
      localStorage.setItem(SHOW_UTC_STORAGE_KEY, value ? 'true' : 'false');
    } catch {
      // Private browsing / storage disabled — the choice just will not persist.
    }
  }

  private restore(): boolean {
    try {
      return localStorage.getItem(SHOW_UTC_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }
}
