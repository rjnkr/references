import { ContractAuditLogEntry, SystemAuditLogEntry } from '../../core/models/audit-log.model';

export type AuditLogKind = 'contract' | 'system';

/** A row from either trail, tagged so the template/dialog can tell them apart. */
export type AnyAuditLogEntry =
  | ({ kind: 'contract' } & ContractAuditLogEntry)
  | ({ kind: 'system' } & SystemAuditLogEntry);

/** Human-readable label for one audit entry, regardless of which trail it came from. */
export function auditEntryLabel(entry: AnyAuditLogEntry): string {
  return entry.kind === 'system'
    ? entry.systemName
    : entry.contractNumber
      ? `${entry.contractNumber} — ${entry.contractName}`
      : entry.contractName;
}
