import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ContractAuditLogEntry, ContractAuditLogQuery, PagedResult } from '../models/audit-log.model';

@Injectable({ providedIn: 'root' })
export class ContractAuditLogService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  list(query: ContractAuditLogQuery): Observable<PagedResult<ContractAuditLogEntry>> {
    let params = new HttpParams();

    const setIfPresent = (key: string, value: unknown) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      params = params.set(key, String(value));
    };

    setIfPresent('contractId', query.contractId);
    setIfPresent('action', query.action);
    setIfPresent('search', query.search?.trim());
    setIfPresent('page', query.page);
    setIfPresent('pageSize', query.pageSize);

    return this.http.get<PagedResult<ContractAuditLogEntry>>(`${this.base}/api/contract-audit-logs`, {
      params,
    });
  }

  get(id: number): Observable<ContractAuditLogEntry> {
    return this.http.get<ContractAuditLogEntry>(`${this.base}/api/contract-audit-logs/${id}`);
  }
}
