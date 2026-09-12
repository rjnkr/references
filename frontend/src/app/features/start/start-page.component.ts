import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { environment } from '../../../environments/environment';

/** One tile on the start screen. Declared as data so the template stays a single loop. */
interface StartTile {
  icon: string;
  title: string;
  description: string;
  link: string;
  cta: string;
  /** Opens in a new tab via a plain link instead of an in-app route - for destinations
   *  outside the Angular app, e.g. the backend's Swagger UI. */
  external?: boolean;
}

/**
 * Landing screen at `/`. Two entry points into the tool — the tabular reference list and
 * the world map — presented as large, obvious targets rather than buried in the navbar.
 */
@Component({
  selector: 'app-start-page',
  imports: [RouterLink, MatCardModule, MatIconModule],
  templateUrl: './start-page.component.html',
  styleUrl: './start-page.component.scss',
})
export class StartPageComponent {
  protected readonly tiles: StartTile[] = [
    {
      icon: 'dns',
      title: 'Systems',
      description: 'Browse, search and manage the delivered systems usable as references',
      link: '/systems',
      cta: 'Open the list',
    },
    {
      icon: 'table_view',
      title: 'Projects',
      description: 'Browse, search and manage the commercial deals behind each reference',
      link: '/projects',
      cta: 'Open the list',
    },
    {
      icon: 'public',
      title: 'World Map',
      description: 'See where Tidalis systems are located, worldwide',
      link: '/map',
      cta: 'Open the map',
    },
    {
      icon: 'menu_book',
      title: 'User Manual',
      description: 'How to use this tool — systems, projects, the world map and more',
      link: '/manual',
      cta: 'Read the manual',
    },
    {
      icon: 'tune',
      title: 'Reference Data',
      description: 'Manage countries, currencies, document types and UN/LOCODEs',
      link: '/reference-data',
      cta: 'Manage reference data',
    },
    {
      icon: 'history',
      title: 'Audit Trail',
      description: 'See who changed which project reference, and what changed',
      link: '/audit-log',
      cta: 'Open the audit trail',
    },
    {
      icon: 'api',
      title: 'API Documentation',
      description: 'Browse and try the REST API (Swagger)',
      link: environment.docsUrl,
      cta: 'Open Swagger',
      external: true,
    },
    {
      icon: 'smart_toy',
      title: 'Connect Claude',
      description: 'Let Claude query project references for you, via MCP',
      link: '/claude-integration',
      cta: 'See how to connect',
    },
  ];

  /** `mat-card` isn't an anchor, so an external tile can't just carry an `href` -
   *  opened explicitly instead, same target/rel a real `<a target="_blank">` would use. */
  openExternal(url: string): void {
    window.open(url, '_blank', 'noopener');
  }
}
