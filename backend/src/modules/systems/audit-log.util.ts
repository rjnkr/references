import { AuditAction, Prisma } from '@prisma/client';
import { SessionUser } from '../../core/decorators/current-user.decorator';
import { ExpandedSystem } from './systems.service';

/**
 * Keys excluded when diffing which top-level fields changed between two system
 * snapshots: timestamps always differ, and the relation *objects* (as opposed to their
 * `*Id` scalar and the child-collection arrays) just duplicate what the scalar/array
 * diff already shows.
 */
const DIFF_IGNORED_KEYS = new Set(['createdAt', 'updatedAt', 'country', 'systemUnlocode']);

/** Field names whose value differs between `before` and `after`. */
export function diffChangedFields(before: ExpandedSystem, after: ExpandedSystem): string[] {
  const beforeRecord = before as unknown as Record<string, unknown>;
  const afterRecord = after as unknown as Record<string, unknown>;
  const keys = new Set([...Object.keys(beforeRecord), ...Object.keys(afterRecord)]);

  const changed: string[] = [];
  for (const key of keys) {
    if (DIFF_IGNORED_KEYS.has(key)) {
      continue;
    }
    if (JSON.stringify(beforeRecord[key]) !== JSON.stringify(afterRecord[key])) {
      changed.push(key);
    }
  }
  return changed;
}

/**
 * Builds the row for `SystemAuditLog.create()`. Always called from inside the same
 * transaction as the change it records, so the audit entry and the change it describes
 * commit or roll back together.
 */
export function buildAuditLogData(
  action: AuditAction,
  system: Pick<ExpandedSystem, 'id' | 'name'>,
  before: ExpandedSystem | undefined,
  after: ExpandedSystem | undefined,
  changedFields: string[] | null,
  user: SessionUser | undefined,
): Prisma.SystemAuditLogUncheckedCreateInput {
  return {
    systemId: system.id,
    systemName: system.name,
    action,
    beforeData: before === undefined ? Prisma.DbNull : (before as unknown as Prisma.InputJsonValue),
    afterData: after === undefined ? Prisma.DbNull : (after as unknown as Prisma.InputJsonValue),
    changedFields:
      changedFields === null ? Prisma.DbNull : (changedFields as unknown as Prisma.InputJsonValue),
    userId: user?.id ?? null,
    userEmail: user?.email ?? 'unknown',
    userName: user?.name ?? null,
  };
}
