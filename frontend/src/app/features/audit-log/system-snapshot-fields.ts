import { SnapshotField, bool, namedList, relation, text } from './snapshot-format';

export const SYSTEM_SNAPSHOT_FIELDS: SnapshotField[] = [
  { key: 'name', label: 'Name', format: text },
  { key: 'contractType', label: 'Type', format: text },
  { key: 'country', label: 'Country', format: relation(['name', 'isoCode']) },
  { key: 'systemUnlocode', label: 'System UN/LOCODE', format: relation(['code', 'name']) },
  { key: 'scope', label: 'Scope', format: text },
  { key: 'products', label: 'Products', format: text },
  { key: 'description', label: 'Description', format: text },
  { key: 'customerDetails', label: 'Customer details', format: text },
  { key: 'endUserDetails', label: 'End user details', format: text },
  { key: 'internalNotes', label: 'Internal notes (internal use only)', format: text },
  { key: 'pocName', label: 'Contact name', format: text },
  { key: 'pocEmail', label: 'Contact email', format: text },
  { key: 'pocPhone', label: 'Contact phone', format: text },
  { key: 'isSensitive', label: 'Sensitive system', format: bool },
  { key: 'canBeUsedAsReference', label: 'Can be used as reference', format: bool },
  { key: 'systemDecommissioned', label: 'System decommissioned', format: bool },
  { key: 'ports', label: 'Ports', format: namedList() },
  {
    key: 'modules',
    label: 'Modules',
    format: (value) =>
      Array.isArray(value) && value.length > 0
        ? value.map((row: Record<string, unknown>) => (row['module'] as { name?: string })?.name).join(', ')
        : '—',
  },
  { key: 'subSystems', label: 'Subsystems', format: namedList() },
  { key: 'externalInterfaces', label: 'External interfaces', format: namedList() },
  { key: 'people', label: 'People', format: namedList() },
  { key: 'documents', label: 'Documents', format: namedList('fileName') },
  {
    key: 'tags',
    label: 'Tags',
    format: (value) =>
      Array.isArray(value) && value.length > 0
        ? value.map((row: Record<string, unknown>) => (row['tag'] as { name?: string })?.name).join(', ')
        : '—',
  },
  {
    key: 'urls',
    label: 'URLs',
    format: (value) =>
      Array.isArray(value) && value.length > 0
        ? value
            .map((row: Record<string, unknown>) => {
              const typeName = (row['urlType'] as { name?: string })?.name ?? 'URL';
              return `${typeName}: ${row['url']}`;
            })
            .join(', ')
        : '—',
  },
];
