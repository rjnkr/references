import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface McpConnectionInfo {
  /** Null when MCP_API_KEY is unset on the server. */
  apiKey: string | null;
}

@Injectable({ providedIn: 'root' })
export class McpService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  /** Requires the normal session cookie - see `McpConnectionInfoController` on the backend. */
  getConnectionInfo(): Observable<McpConnectionInfo> {
    return this.http.get<McpConnectionInfo>(`${this.base}/api/mcp/connection-info`);
  }
}
