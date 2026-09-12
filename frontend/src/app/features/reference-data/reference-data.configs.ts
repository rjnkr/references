import { Country, Currency, DocumentType, Module, Tag, UnLocode, UrlType } from '../../core/models/lookup.models';
import { ReferenceEntityConfig } from './reference-data.model';

export const COUNTRY_CONFIG: ReferenceEntityConfig<Country> = {
  key: 'countries',
  title: 'Countries',
  icon: 'flag',
  description: 'ISO 3166-1 countries.',
  singular: 'country',
  emptyMessage: 'No countries recorded yet.',
  rowLabel: (row) => row.name,
  columns: [
    { key: 'isoCode', label: 'ISO Code', render: (row) => row.isoCode },
    { key: 'name', label: 'Name', render: (row) => row.name },
  ],
  fields: [
    {
      key: 'isoCode',
      label: 'ISO code',
      type: 'text',
      required: true,
      minLength: 2,
      maxLength: 2,
      uppercase: true,
      placeholder: 'NL',
      hint: 'ISO 3166-1 alpha-2, e.g. NL',
    },
    { key: 'name', label: 'Name', type: 'text', required: true, maxLength: 100 },
  ],
};

export const CURRENCY_CONFIG: ReferenceEntityConfig<Currency> = {
  key: 'currencies',
  title: 'Currencies',
  icon: 'payments',
  description: 'ISO 4217 currencies used for pricing.',
  singular: 'currency',
  emptyMessage: 'No currencies recorded yet.',
  rowLabel: (row) => `${row.code} — ${row.name}`,
  columns: [
    { key: 'code', label: 'Code', render: (row) => row.code },
    { key: 'name', label: 'Name', render: (row) => row.name },
    { key: 'symbol', label: 'Symbol', render: (row) => row.symbol ?? '—' },
  ],
  fields: [
    {
      key: 'code',
      label: 'Code',
      type: 'text',
      required: true,
      minLength: 3,
      maxLength: 3,
      uppercase: true,
      placeholder: 'EUR',
      hint: 'ISO 4217 alphabetic code, e.g. EUR',
    },
    { key: 'name', label: 'Name', type: 'text', required: true, maxLength: 100 },
    { key: 'symbol', label: 'Symbol', type: 'text', maxLength: 8, placeholder: '€' },
  ],
};

export const DOCUMENT_TYPE_CONFIG: ReferenceEntityConfig<DocumentType> = {
  key: 'document-types',
  title: 'Document Types',
  icon: 'description',
  description: 'Classifications available when uploading a document to a project.',
  singular: 'document type',
  emptyMessage: 'No document types recorded yet.',
  rowLabel: (row) => row.name,
  columns: [{ key: 'name', label: 'Name', render: (row) => row.name }],
  fields: [{ key: 'name', label: 'Name', type: 'text', required: true, maxLength: 100 }],
};

export const MODULE_CONFIG: ReferenceEntityConfig<Module> = {
  key: 'modules',
  title: 'Modules',
  icon: 'extension',
  description: 'Named software modules that can be delivered as part of a system.',
  singular: 'module',
  emptyMessage: 'No modules recorded yet.',
  rowLabel: (row) => row.name,
  columns: [{ key: 'name', label: 'Name', render: (row) => row.name }],
  fields: [{ key: 'name', label: 'Name', type: 'text', required: true, maxLength: 150 }],
};

export const URL_TYPE_CONFIG: ReferenceEntityConfig<UrlType> = {
  key: 'url-types',
  title: 'URL Types',
  icon: 'link',
  description: 'Classifications for a URL recorded against a project or system, e.g. Pipedrive.',
  singular: 'URL type',
  emptyMessage: 'No URL types recorded yet.',
  rowLabel: (row) => row.name,
  columns: [{ key: 'name', label: 'Name', render: (row) => row.name }],
  fields: [{ key: 'name', label: 'Name', type: 'text', required: true, maxLength: 100 }],
};

export const TAG_CONFIG: ReferenceEntityConfig<Tag> = {
  key: 'tags',
  title: 'Tags',
  icon: 'sell',
  description: 'Coloured labels that can be attached to projects and systems.',
  singular: 'tag',
  emptyMessage: 'No tags recorded yet.',
  rowLabel: (row) => row.name,
  columns: [
    { key: 'code', label: 'Code', render: (row) => row.code },
    { key: 'name', label: 'Name', render: (row) => row.name },
    { key: 'backgroundColor', label: 'Background', render: (row) => row.backgroundColor },
    { key: 'textColor', label: 'Text', render: (row) => row.textColor },
    {
      key: 'preview',
      label: 'Preview',
      render: (row) => row.name,
      chip: (row) => ({ label: row.name, backgroundColor: row.backgroundColor, textColor: row.textColor }),
    },
  ],
  fields: [
    {
      key: 'code',
      label: 'Code',
      type: 'text',
      required: true,
      maxLength: 20,
      uppercase: true,
      placeholder: 'VIP',
      hint: 'Short unique code, e.g. VIP',
    },
    { key: 'name', label: 'Name', type: 'text', required: true, maxLength: 100 },
    {
      key: 'backgroundColor',
      label: 'Background colour',
      type: 'color',
      required: true,
      placeholder: '#1E88E5',
    },
    {
      key: 'textColor',
      label: 'Text colour',
      type: 'color',
      required: true,
      placeholder: '#FFFFFF',
    },
  ],
  preview: (value) => {
    const name = typeof value['name'] === 'string' ? value['name'].trim() : '';
    const backgroundColor = value['backgroundColor'];
    const textColor = value['textColor'];
    const isHex = (v: unknown): v is string => typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v);
    if (!name || !isHex(backgroundColor) || !isHex(textColor)) {
      return null;
    }
    return { label: name, backgroundColor, textColor };
  },
};

/** Countries are only needed to populate the UN/LOCODE country dropdown — injected at
 *  render time by the reference-table page rather than baked into this static config. */
export function unlocodeConfig(countries: () => Country[]): ReferenceEntityConfig<UnLocode> {
  return {
    key: 'unlocodes',
    title: 'UN/LOCODEs',
    icon: 'anchor',
    description: 'Port and location codes used for project and ports.',
    singular: 'UN/LOCODE',
    emptyMessage: 'No matches — try a different search term.',
    searchMinLength: 2,
    rowLabel: (row) => `${row.code} — ${row.name}`,
    columns: [
      { key: 'code', label: 'Code', render: (row) => row.code },
      { key: 'name', label: 'Name', render: (row) => row.name },
      { key: 'country', label: 'Country', render: (row) => row.country?.name ?? '—' },
      {
        key: 'latitude',
        label: 'Latitude',
        align: 'end',
        render: (row) => (row.latitude != null ? row.latitude.toFixed(4) : '—'),
      },
      {
        key: 'longitude',
        label: 'Longitude',
        align: 'end',
        render: (row) => (row.longitude != null ? row.longitude.toFixed(4) : '—'),
      },
    ],
    fields: [
      {
        key: 'code',
        label: 'Code',
        type: 'text',
        required: true,
        minLength: 5,
        maxLength: 5,
        uppercase: true,
        placeholder: 'NLRTM',
        hint: 'Country code + location code, no space, e.g. NLRTM',
      },
      { key: 'name', label: 'Location name', type: 'text', required: true, maxLength: 150 },
      {
        key: 'countryId',
        label: 'Country',
        type: 'select',
        options: () => countries().map((c) => ({ value: c.id, label: `${c.name} (${c.isoCode})` })),
      },
      {
        key: 'latitude',
        label: 'Latitude',
        type: 'number',
        min: -90,
        max: 90,
        hint: 'WGS84, -90 to 90',
      },
      {
        key: 'longitude',
        label: 'Longitude',
        type: 'number',
        min: -180,
        max: 180,
        hint: 'WGS84, -180 to 180',
      },
    ],
  };
}
