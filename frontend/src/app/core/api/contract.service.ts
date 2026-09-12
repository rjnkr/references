import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Contract,
  ContractDocument,
  ContractQuery,
  ContractWritePayload,
  PagedResult,
  SortDirection,
} from '../models/contract.models';

@Injectable({ providedIn: 'root' })
export class ContractService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  /**
   * Encoding used for the `sort` query parameter: bare field name for ascending,
   * `-field` for descending (e.g. `sort=-awardDate`) — matches the backend's
   * `buildOrderBy` in contracts.service.ts.
   */
  static encodeSort(active: string, direction: SortDirection | ''): string | undefined {
    if (!active || !direction) {
      return undefined;
    }
    return direction === 'desc' ? `-${active}` : active;
  }

  list(query: ContractQuery): Observable<PagedResult<Contract>> {
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

    return this.http.get<PagedResult<Contract>>(`${this.base}/api/contracts`, { params });
  }

  get(id: number): Observable<Contract> {
    return this.http.get<Contract>(`${this.base}/api/contracts/${id}`);
  }

  create(payload: ContractWritePayload): Observable<Contract> {
    return this.http.post<Contract>(`${this.base}/api/contracts`, payload);
  }

  update(id: number, payload: ContractWritePayload): Observable<Contract> {
    return this.http.patch<Contract>(`${this.base}/api/contracts/${id}`, payload);
  }

  delete(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/api/contracts/${id}`);
  }

  /** Undoes a soft delete - only ever offered from the audit trail's DELETE entry. */
  restore(id: number): Observable<Contract> {
    return this.http.post<Contract>(`${this.base}/api/contracts/${id}/restore`, {});
  }

  /* --- Documents ------------------------------------------------------------------ */

  uploadDocument(contractId: number, file: File, documentTypeId: number): Observable<ContractDocument> {
    const form = new FormData();
    form.append('file', file, file.name);
    form.append('documentType', String(documentTypeId));
    return this.http.post<ContractDocument>(
      `${this.base}/api/contracts/${contractId}/documents`,
      form,
    );
  }

  deleteDocument(contractId: number, documentId: number): Observable<unknown> {
    return this.http.delete(`${this.base}/api/contracts/${contractId}/documents/${documentId}`);
  }

  /**
   * Download URL for an existing document. Deliberately returned as a plain URL so the
   * template can use a real `<a href>`/`target="_blank"` and let the browser handle
   * `Content-Disposition` (rather than buffering the file through XHR into a blob).
   */
  documentDownloadUrl(contractId: number, documentId: number): string {
    return `${this.base}/api/contracts/${contractId}/documents/${documentId}`;
  }
}
