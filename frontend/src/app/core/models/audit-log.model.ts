/**
 * Audit trail entities. Read-only from the frontend's point of view: entries are
 * written internally by the backend alongside every contract/system create/update/delete.
 */

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE';

export const AUDIT_ACTIONS: AuditAction[] = ['CREATE', 'UPDATE', 'DELETE', 'RESTORE'];

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  CREATE: 'Created',
  UPDATE: 'Updated',
  DELETE: 'Deleted',
  RESTORE: 'Restored',
};

/**
 * `beforeData`/`afterData` are the full expanded contract as the API returns it at that
 * point in time - typed loosely here since the shape is a historical snapshot, not the
 * live `Contract` model (a since-renamed or since-removed field must still render).
 */
export interface ContractAuditLogEntry {
  id: number;
  contractId: number;
  contractNumber: string | null;
  contractName: string;
  action: AuditAction;
  beforeData: Record<string, unknown> | null;
  afterData: Record<string, unknown> | null;
  changedFields: string[] | null;
  userId: number | null;
  userEmail: string;
  userName: string | null;
  createdAt: string;
}

/** Same shape as `ContractAuditLogEntry`, for `System` create/update/delete/restore instead. */
export interface SystemAuditLogEntry {
  id: number;
  systemId: number;
  systemName: string;
  action: AuditAction;
  beforeData: Record<string, unknown> | null;
  afterData: Record<string, unknown> | null;
  changedFields: string[] | null;
  userId: number | null;
  userEmail: string;
  userName: string | null;
  createdAt: string;
}

export interface ContractAuditLogQuery {
  contractId?: number;
  action?: AuditAction | '';
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface SystemAuditLogQuery {
  systemId?: number;
  action?: AuditAction | '';
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  data: T[];
  total: number;
}
