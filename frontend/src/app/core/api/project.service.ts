import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  PagedResult,
  Project,
  ProjectDocument,
  ProjectQuery,
  ProjectWritePayload,
  SortDirection,
} from '../models/project.models';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  /**
   * Encoding used for the `sort` query parameter: bare field name for ascending,
   * `-field` for descending (e.g. `sort=-awardDate`) — matches the backend's
   * `buildOrderBy` in projects.service.ts.
   */
  static encodeSort(active: string, direction: SortDirection | ''): string | undefined {
    if (!active || !direction) {
      return undefined;
    }
    return direction === 'desc' ? `-${active}` : active;
  }

  list(query: ProjectQuery): Observable<PagedResult<Project>> {
    let params = new HttpParams();

    const setIfPresent = (key: string, value: unknown) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      params = params.set(key, String(value));
    };

    setIfPresent('search', query.search?.trim());
    setIfPresent('currencyId', query.currencyId);
    setIfPresent('systemId', query.systemId);
    setIfPresent('sort', query.sort);
    setIfPresent('page', query.page);
    setIfPresent('pageSize', query.pageSize);

    return this.http.get<PagedResult<Project>>(`${this.base}/api/projects`, { params });
  }

  get(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.base}/api/projects/${id}`);
  }

  create(payload: ProjectWritePayload): Observable<Project> {
    return this.http.post<Project>(`${this.base}/api/projects`, payload);
  }

  update(id: number, payload: ProjectWritePayload): Observable<Project> {
    return this.http.patch<Project>(`${this.base}/api/projects/${id}`, payload);
  }

  delete(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/api/projects/${id}`);
  }

  /** Undoes a soft delete - only ever offered from the audit trail's DELETE entry. */
  restore(id: number): Observable<Project> {
    return this.http.post<Project>(`${this.base}/api/projects/${id}/restore`, {});
  }

  /* --- Documents ------------------------------------------------------------------ */

  uploadDocument(projectId: number, file: File, documentTypeId: number): Observable<ProjectDocument> {
    const form = new FormData();
    form.append('file', file, file.name);
    form.append('documentType', String(documentTypeId));
    return this.http.post<ProjectDocument>(
      `${this.base}/api/projects/${projectId}/documents`,
      form,
    );
  }

  deleteDocument(projectId: number, documentId: number): Observable<unknown> {
    return this.http.delete(`${this.base}/api/projects/${projectId}/documents/${documentId}`);
  }

  /**
   * Download URL for an existing document. Deliberately returned as a plain URL so the
   * template can use a real `<a href>`/`target="_blank"` and let the browser handle
   * `Content-Disposition` (rather than buffering the file through XHR into a blob).
   */
  documentDownloadUrl(projectId: number, documentId: number): string {
    return `${this.base}/api/projects/${projectId}/documents/${documentId}`;
  }
}
