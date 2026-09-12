import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Thin REST client shared by every reference-data table (countries, currencies, document
 * types, UN/LOCODEs). Not `@Injectable` itself — the backend already exposes plain,
 * uniform CRUD endpoints for these lookup tables (see `countries.controller.ts` and its
 * siblings), so one small client instantiated per entity is enough; no need for four
 * near-identical services.
 */
export class ReferenceCrudClient<T> {
  constructor(
    private readonly http: HttpClient,
    private readonly baseUrl: string,
    private readonly path: string,
  ) {}

  list(search?: string): Observable<T[]> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<T[]>(`${this.baseUrl}/api/${this.path}`, { params });
  }

  create(payload: Partial<T>): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/api/${this.path}`, payload);
  }

  update(id: number, payload: Partial<T>): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/api/${this.path}/${id}`, payload);
  }

  remove(id: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/api/${this.path}/${id}`);
  }
}
