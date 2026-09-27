import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import {
  COUNTRY_CONFIG,
  CURRENCY_CONFIG,
  DOCUMENT_TYPE_CONFIG,
  PRODUCT_CONFIG,
  TAG_CONFIG,
  URL_TYPE_CONFIG,
  moduleConfig,
  unlocodeConfig,
} from './reference-data.configs';

interface ReferenceTile {
  icon: string;
  title: string;
  description: string;
  link: string;
}

/**
 * Landing screen at `/reference-data` — reachable only from the home screen's own tile
 * (there is deliberately no navbar entry, see `app.component.html`). Lets an admin manage
 * the lookup tables (countries, currencies, document types, UN/LOCODEs) that used to
 * require a direct database edit.
 */
@Component({
  selector: 'app-reference-data-page',
  imports: [RouterLink, MatCardModule, MatIconModule],
  templateUrl: './reference-data-page.component.html',
  styleUrl: './reference-data-page.component.scss',
})
export class ReferenceDataPageComponent {
  // `unlocodeConfig`/`moduleConfig` need a lookup accessor at runtime; an empty stand-in is enough
  // here since this landing page only reads `title`/`icon`/`description`.
  protected readonly tiles: ReferenceTile[] = [
    COUNTRY_CONFIG,
    CURRENCY_CONFIG,
    DOCUMENT_TYPE_CONFIG,
    URL_TYPE_CONFIG,
    TAG_CONFIG,
    moduleConfig(() => []),
    PRODUCT_CONFIG,
    unlocodeConfig(() => []),
  ].map((config) => ({
    icon: config.icon,
    title: config.title,
    description: config.description,
    link: `/reference-data/${config.key}`,
  }));
}
