import { PROJECT_TAG_LABELS, ProjectTag } from '../../core/models/project.models';
import { SnapshotField, date, dateTime, money, namedList, relation, text } from './snapshot-format';

const projectType = (value: unknown): string =>
  Array.isArray(value) && value.length > 0
    ? value.map((tag) => PROJECT_TAG_LABELS[tag as ProjectTag] ?? String(tag)).join(', ')
    : '—';

export const PROJECT_SNAPSHOT_FIELDS: SnapshotField[] = [
  { key: 'projectNumber', label: 'Project number', format: text },
  { key: 'name', label: 'Name', format: text },
  { key: 'system', label: 'System', format: relation(['name']) },
  { key: 'awardDate', label: 'Award date', format: date },
  { key: 'endDate', label: 'End date', format: date },
  { key: 'projectType', label: 'Project type', format: projectType },
  { key: 'currency', label: 'Currency', format: relation(['code', 'name']) },
  { key: 'implementationPrice', label: 'Implementation price', format: money },
  { key: 'maintenancePricePerYear', label: 'Maintenance price / year', format: money },
  { key: 'newDevelopments', label: 'New developments', format: text },
  { key: 'implementationDetails', label: 'Implementation details', format: text },
  { key: 'pipedriveNumber', label: 'Pipedrive number', format: text },
  { key: 'internalNotes', label: 'Internal notes (internal use only)', format: text },
  {
    key: 'completionDates',
    label: 'Completion dates',
    format: (value) =>
      Array.isArray(value) && value.length > 0
        ? value.map((row: Record<string, unknown>) => date(row['completionDate'])).join(', ')
        : '—',
  },
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
  { key: 'updatedAt', label: 'Last updated', format: dateTime },
];
