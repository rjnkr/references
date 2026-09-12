import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, forkJoin, map, of, shareReplay, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Country, Currency, DocumentType, Module, Tag, UnLocode, UrlType } from '../models/lookup.models';

/**
 * Read-only access to the lookup tables. Currencies / countries / document types are
 * small and stable, so they are fetched once and cached for the session; UN/LOCODEs are
 * far too numerous to cache, so they are queried through the `search` typeahead.
 */
@Injectable({ providedIn: 'root' })
export class LookupService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  private currencies$?: Observable<Currency[]>;
  private countries$?: Observable<Country[]>;
  private documentTypes$?: Observable<DocumentType[]>;
  private tags$?: Observable<Tag[]>;
  private urlTypes$?: Observable<UrlType[]>;
  private modules$?: Observable<Module[]>;

  /** Synchronous mirrors, handy for template lookups and table cell rendering. */
  readonly currencies = signal<Currency[]>([]);
  readonly countries = signal<Country[]>([]);
  readonly documentTypes = signal<DocumentType[]>([]);
  readonly tags = signal<Tag[]>([]);
  readonly urlTypes = signal<UrlType[]>([]);
  readonly modules = signal<Module[]>([]);

  getCurrencies(): Observable<Currency[]> {
    this.currencies$ ??= this.http.get<Currency[]>(`${this.base}/api/currencies`).pipe(
      map((rows) => rows ?? []),
      tap((rows) => this.currencies.set(rows)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.currencies$;
  }

  getCountries(): Observable<Country[]> {
    this.countries$ ??= this.http.get<Country[]>(`${this.base}/api/countries`).pipe(
      map((rows) => (rows ?? []).slice().sort((a, b) => a.name.localeCompare(b.name))),
      tap((rows) => this.countries.set(rows)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.countries$;
  }

  getDocumentTypes(): Observable<DocumentType[]> {
    this.documentTypes$ ??= this.http.get<DocumentType[]>(`${this.base}/api/document-types`).pipe(
      map((rows) => rows ?? []),
      tap((rows) => this.documentTypes.set(rows)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.documentTypes$;
  }

  getTags(): Observable<Tag[]> {
    this.tags$ ??= this.http.get<Tag[]>(`${this.base}/api/tags`).pipe(
      map((rows) => rows ?? []),
      tap((rows) => this.tags.set(rows)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.tags$;
  }

  getUrlTypes(): Observable<UrlType[]> {
    this.urlTypes$ ??= this.http.get<UrlType[]>(`${this.base}/api/url-types`).pipe(
      map((rows) => rows ?? []),
      tap((rows) => this.urlTypes.set(rows)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.urlTypes$;
  }

  getModules(): Observable<Module[]> {
    this.modules$ ??= this.http.get<Module[]>(`${this.base}/api/modules`).pipe(
      map((rows) => rows ?? []),
      tap((rows) => this.modules.set(rows)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.modules$;
  }

  /** Loads everything the list screen and the detail form need for their dropdowns. */
  preload(): Observable<unknown> {
    return forkJoin({
      currencies: this.getCurrencies(),
      countries: this.getCountries(),
      documentTypes: this.getDocumentTypes(),
      tags: this.getTags(),
      urlTypes: this.getUrlTypes(),
      modules: this.getModules(),
    });
  }

  /**
   * Drops the cached observable for a lookup table so the next `get*()` call re-fetches
   * it. Called by the reference-data admin screens after a create/update/delete so the
   * rest of the app (contract dropdowns, chips, …) stops serving stale cached rows without
   * requiring a full page reload.
   */
  invalidate(table: 'currencies' | 'countries' | 'documentTypes' | 'tags' | 'urlTypes' | 'modules'): void {
    if (table === 'currencies') {
      this.currencies$ = undefined;
    } else if (table === 'countries') {
      this.countries$ = undefined;
    } else if (table === 'documentTypes') {
      this.documentTypes$ = undefined;
    } else if (table === 'tags') {
      this.tags$ = undefined;
    } else if (table === 'urlTypes') {
      this.urlTypes$ = undefined;
    } else {
      this.modules$ = undefined;
    }
  }

  /** UN/LOCODE typeahead. Empty/short terms are not sent to the server. */
  searchUnlocodes(search: string): Observable<UnLocode[]> {
    const term = (search ?? '').trim();
    if (term.length < 2) {
      return of([]);
    }
    return this.http
      .get<UnLocode[]>(`${this.base}/api/unlocodes`, { params: { search: term } })
      .pipe(map((rows) => rows ?? []));
  }
}
