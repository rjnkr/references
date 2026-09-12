import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuditLogEntry, AuditLogQuery, PagedResult } from '../models/audit-log.model';

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  list(query: AuditLogQuery): Observable<PagedResult<AuditLogEntry>> {
    let params = new HttpParams();

    const setIfPresent = (key: string, value: unknown) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      params = params.set(key, String(value));
    };

    setIfPresent('projectId', query.projectId);
    setIfPresent('action', query.action);
    setIfPresent('search', query.search?.trim());
    setIfPresent('page', query.page);
    setIfPresent('pageSize', query.pageSize);

    return this.http.get<PagedResult<AuditLogEntry>>(`${this.base}/api/audit-logs`, { params });
  }

  get(id: number): Observable<AuditLogEntry> {
    return this.http.get<AuditLogEntry>(`${this.base}/api/audit-logs/${id}`);
  }
}
