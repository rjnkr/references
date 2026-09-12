import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { MapReferencePoint } from '../models/map.models';

@Injectable({ providedIn: 'root' })
export class MapService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  /**
   * Two layers in one list, told apart by `kind` — see `MapReferencePoint`'s doc comment.
   * Already grouped by location within each kind. Relative URL in dev too, so the
   * dev-server proxy keeps us on one origin and the httpOnly session cookie is sent
   * (see `credentialsInterceptor`).
   */
  referencePoints(): Observable<MapReferencePoint[]> {
    return this.http.get<MapReferencePoint[]>(`${this.base}/api/map/reference-points`);
  }
}
