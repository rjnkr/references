import { Clipboard } from '@angular/cdk/clipboard';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';

import { McpService } from '../../core/api/mcp.service';
import { environment } from '../../../environments/environment';

interface McpTool {
  name: string;
  args: string;
  returns: string;
}

/** Shown in place of the real key while it's still loading, and as a fallback if
 *  MCP_API_KEY isn't set on the server at all (see `keyMissing`). */
const PLACEHOLDER_KEY = 'YOUR_MCP_API_KEY';

/**
 * "Connect Claude" — reachable only from the home screen's own tile, same as Reference
 * Data and Audit Trail. The actual integration point is the MCP server described in
 * `backend/src/mcp/` (see that module's doc comments and
 * `backend/README.md#mcp-server-for-ai-applications`, which this page mirrors); the one
 * thing this page itself does is fetch the live `X-MCP-Key` value (via the
 * session-cookie-authenticated `GET /api/mcp/connection-info`, not the MCP endpoint
 * itself) so a signed-in user gets a working, copy-pasteable configuration straight away
 * instead of a placeholder to hunt down and substitute by hand.
 */
@Component({
  selector: 'app-claude-integration-page',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatTooltipModule, MatProgressBarModule],
  templateUrl: './claude-integration-page.component.html',
  styleUrl: './claude-integration-page.component.scss',
})
export class ClaudeIntegrationPageComponent {
  private readonly clipboard = inject(Clipboard);
  private readonly snackbar = inject(MatSnackBar);
  private readonly mcp = inject(McpService);

  protected readonly mcpUrl = environment.mcpUrl;

  protected readonly loadingKey = signal(true);
  /** Null while loading and if the server has no key configured at all. */
  protected readonly apiKey = signal<string | null>(null);
  /** True once loaded, when the server genuinely has no MCP_API_KEY set. */
  protected readonly keyMissing = signal(false);

  protected readonly displayKey = computed(() => this.apiKey() ?? PLACEHOLDER_KEY);

  protected readonly configSnippet = computed(() =>
    JSON.stringify(
      {
        mcpServers: {
          'tidalis-references': {
            url: this.mcpUrl,
            headers: { 'X-MCP-Key': this.displayKey() },
          },
        },
      },
      null,
      2,
    ),
  );

  protected readonly curlSnippet = computed(
    () => `curl -N -H "X-MCP-Key: ${this.displayKey()}" ${this.mcpUrl}`,
  );

  protected readonly tools: McpTool[] = [
    {
      name: 'list_systems',
      args: 'search?, projectType?, countryId?, limit?',
      returns: 'Compact system summaries',
    },
    {
      name: 'get_system',
      args: 'id',
      returns: 'One fully expanded system, with its linked projects',
    },
    {
      name: 'search_reference_systems',
      args: 'query, projectType?, limit?',
      returns: 'Quotable reference systems only',
    },
    {
      name: 'list_projects',
      args: 'search?, systemId?, limit?',
      returns: 'Compact commercial-deal summaries',
    },
    {
      name: 'get_project',
      args: 'id? or projectNumber?',
      returns: 'One fully expanded project',
    },
    { name: 'list_currencies', args: '–', returns: 'Currency lookup' },
    { name: 'list_countries', args: '–', returns: 'Country lookup' },
    { name: 'list_unlocodes', args: 'search?, limit?', returns: 'UN/LOCODE lookup' },
    { name: 'list_document_types', args: '–', returns: 'Document type lookup' },
  ];

  protected readonly examplePrompts = [
    'Do we have a VTS system in Belgium we can use as a reference?',
    'List every coastal radar system delivered in the last two years.',
    'Give me the full details of project TID-2024-017.',
    'What currencies can project prices be recorded in?',
    'What is the UN/LOCODE for Rotterdam?',
  ];

  constructor() {
    this.mcp.getConnectionInfo().subscribe({
      next: (info) => {
        this.apiKey.set(info.apiKey);
        this.keyMissing.set(info.apiKey === null);
        this.loadingKey.set(false);
      },
      error: () => {
        this.keyMissing.set(true);
        this.loadingKey.set(false);
      },
    });
  }

  copy(text: string, label: string): void {
    this.clipboard.copy(text);
    this.snackbar.open(`${label} copied to clipboard.`, 'Dismiss', {
      duration: 3000,
      panelClass: 'tidalis-snackbar-success',
    });
  }
}
