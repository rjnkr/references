import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PagedResult, SystemAuditLogEntry, SystemAuditLogQuery } from '../models/audit-log.model';

@Injectable({ providedIn: 'root' })
export class SystemAuditLogService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  list(query: SystemAuditLogQuery): Observable<PagedResult<SystemAuditLogEntry>> {
    let params = new HttpParams();

    const setIfPresent = (key: string, value: unknown) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      params = params.set(key, String(value));
    };

    setIfPresent('systemId', query.systemId);
    setIfPresent('action', query.action);
    setIfPresent('search', query.search?.trim());
    setIfPresent('page', query.page);
    setIfPresent('pageSize', query.pageSize);

    return this.http.get<PagedResult<SystemAuditLogEntry>>(`${this.base}/api/system-audit-logs`, {
      params,
    });
  }

  get(id: number): Observable<SystemAuditLogEntry> {
    return this.http.get<SystemAuditLogEntry>(`${this.base}/api/system-audit-logs/${id}`);
  }
}
