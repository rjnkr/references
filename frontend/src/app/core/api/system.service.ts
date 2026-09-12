import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PagedResult, SortDirection } from '../models/project.models';
import { System, SystemDocument, SystemQuery, SystemWritePayload } from '../models/system.models';

@Injectable({ providedIn: 'root' })
export class SystemService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  /**
   * Encoding used for the `sort` query parameter: bare field name for ascending,
   * `-field` for descending (e.g. `sort=-createdAt`) — matches the backend's
   * `buildOrderBy` in systems.service.ts.
   */
  static encodeSort(active: string, direction: SortDirection | ''): string | undefined {
    if (!active || !direction) {
      return undefined;
    }
    return direction === 'desc' ? `-${active}` : active;
  }

  list(query: SystemQuery): Observable<PagedResult<System>> {
    let params = new HttpParams();

    const setIfPresent = (key: string, value: unknown) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      params = params.set(key, String(value));
    };

    setIfPresent('search', query.search?.trim());
    setIfPresent('projectType', query.projectType);
    setIfPresent('countryId', query.countryId);
    setIfPresent('isSensitive', query.isSensitive);
    setIfPresent('canBeUsedAsReference', query.canBeUsedAsReference);
    setIfPresent('systemDecommissioned', query.systemDecommissioned);
    setIfPresent('sort', query.sort);
    setIfPresent('page', query.page);
    setIfPresent('pageSize', query.pageSize);

    return this.http.get<PagedResult<System>>(`${this.base}/api/systems`, { params });
  }

  get(id: number): Observable<System> {
    return this.http.get<System>(`${this.base}/api/systems/${id}`);
  }

  create(payload: SystemWritePayload): Observable<System> {
    return this.http.post<System>(`${this.base}/api/systems`, payload);
  }

  update(id: number, payload: SystemWritePayload): Observable<System> {
    return this.http.patch<System>(`${this.base}/api/systems/${id}`, payload);
  }

  delete(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/api/systems/${id}`);
  }

  /** Undoes a soft delete - only ever offered from the audit trail's DELETE entry. */
  restore(id: number): Observable<System> {
    return this.http.post<System>(`${this.base}/api/systems/${id}/restore`, {});
  }

  /* --- Documents ------------------------------------------------------------------ */

  uploadDocument(systemId: number, file: File, documentTypeId: number): Observable<SystemDocument> {
    const form = new FormData();
    form.append('file', file, file.name);
    form.append('documentType', String(documentTypeId));
    return this.http.post<SystemDocument>(`${this.base}/api/systems/${systemId}/documents`, form);
  }

  deleteDocument(systemId: number, documentId: number): Observable<unknown> {
    return this.http.delete(`${this.base}/api/systems/${systemId}/documents/${documentId}`);
  }

  /**
   * Download URL for an existing document. Deliberately returned as a plain URL so the
   * template can use a real `<a href>`/`target="_blank"` and let the browser handle
   * `Content-Disposition` (rather than buffering the file through XHR into a blob).
   */
  documentDownloadUrl(systemId: number, documentId: number): string {
    return `${this.base}/api/systems/${systemId}/documents/${documentId}`;
  }
}
