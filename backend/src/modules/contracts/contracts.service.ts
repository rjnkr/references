import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DbService } from '../../database/db-service/db.service';
import { SessionUser } from '../../core/decorators/current-user.decorator';
import { toTagId } from '../../core/validators/loose-array.validator';
import { buildAuditLogData, diffChangedFields } from './audit-log.util';
import { CreateContractRequestDto } from './dto/create-contract-request.dto';
import { QueryContractsDto, SORTABLE_CONTRACT_FIELDS } from './dto/query-contracts.dto';
import { UpdateContractRequestDto } from './dto/update-contract-request.dto';

/**
 * Everything the frontend list and detail views need, so neither has to make a
 * second round-trip. Shared with the MCP server.
 */
export const CONTRACT_INCLUDE = {
  currency: true,
  system: true,
  completionDates: { orderBy: { completionDate: 'asc' } },
  documents: { include: { documentType: true }, orderBy: { uploadedAt: 'desc' } },
  tags: { include: { tag: true }, orderBy: { tag: { name: 'asc' } } },
  urls: { include: { urlType: true } },
} satisfies Prisma.ContractInclude;

/** The contract payload minus the child collections. */
type ContractScalarInput = Omit<CreateContractRequestDto, 'completionDates' | 'tags' | 'urls'>;

/** The fully expanded contract shape returned by every read/write below - also what
 *  gets snapshotted into `ContractAuditLog.beforeData`/`afterData`. */
export type ExpandedContract = Prisma.ContractGetPayload<{ include: typeof CONTRACT_INCLUDE }>;

@Injectable()
export class ContractsService {
  constructor(private readonly db: DbService) {}

  // -------------------------------------------------------------------------
  // Reads
  // -------------------------------------------------------------------------

  /**
   * Paginated, filtered list. Returns `{ data, total }` where every item is
   * the fully expanded contract (lookups + all child collections).
   */
  async findAll(query: QueryContractsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 25;

    const where = this.buildWhere(query);
    const orderBy = this.buildOrderBy(query.sort);

    const [data, total] = await this.db.$transaction([
      this.db.contract.findMany({
        where,
        include: CONTRACT_INCLUDE,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.db.contract.count({ where }),
    ]);

    return { data, total };
  }

  /** A soft-deleted contract 404s here exactly as a hard-deleted one used to. */
  findOne(id: number) {
    return this.db.contract.findFirstOrThrow({ where: { id, deleted: false }, include: CONTRACT_INCLUDE });
  }

  findByContractNumber(contractNumber: string) {
    return this.db.contract.findFirstOrThrow({
      where: { contractNumber, deleted: false },
      include: CONTRACT_INCLUDE,
    });
  }

  private buildWhere(query: QueryContractsDto): Prisma.ContractWhereInput {
    // Soft-deleted contracts never surface through the normal API - only their audit
    // trail entry remains, from where they can be restored.
    const where: Prisma.ContractWhereInput = { deleted: false };

    if (query.search) {
      where.OR = [
        { contractNumber: { contains: query.search } },
        { name: { contains: query.search } },
      ];
    }
    if (query.currencyId !== undefined) {
      where.currencyId = query.currencyId;
    }
    if (query.systemId !== undefined) {
      where.systemId = query.systemId;
    }

    return where;
  }

  /** `sort=contractNumber` ascending, `sort=-awardDate` descending. */
  private buildOrderBy(sort?: string): Prisma.ContractOrderByWithRelationInput {
    if (!sort) {
      return { awardDate: 'desc' };
    }

    const descending = sort.startsWith('-');
    const field = descending ? sort.slice(1) : sort;

    if (!(SORTABLE_CONTRACT_FIELDS as readonly string[]).includes(field)) {
      throw new BadRequestException(
        `Cannot sort on "${field}". Allowed fields: ${SORTABLE_CONTRACT_FIELDS.join(', ')}`,
      );
    }

    return { [field]: descending ? 'desc' : 'asc' } as Prisma.ContractOrderByWithRelationInput;
  }

  // -------------------------------------------------------------------------
  // Writes
  // -------------------------------------------------------------------------

  /**
   * Creates the contract and every supplied child row in one transaction. The audit
   * entry is written in the same transaction, so a contract is never created without
   * one (and vice versa).
   */
  async create(dto: CreateContractRequestDto, user?: SessionUser) {
    const { children, scalars } = this.split(dto);

    return this.db.$transaction(async (tx) => {
      const created = await tx.contract.create({
        data: {
          ...(this.toPrismaScalars(scalars) as Prisma.ContractUncheckedCreateInput),
          completionDates: children.completionDates
            ? { create: children.completionDates }
            : undefined,
          tags: children.tags ? { create: children.tags } : undefined,
          urls: children.urls ? { create: children.urls } : undefined,
        },
        select: { id: true },
      });

      const full = await tx.contract.findUniqueOrThrow({
        where: { id: created.id },
        include: CONTRACT_INCLUDE,
      });

      await tx.contractAuditLog.create({
        data: buildAuditLogData('CREATE', full, undefined, full, null, user),
      });

      return full;
    });
  }

  /**
   * Updates scalar fields and replaces the child collections that are present
   * in the payload. A collection that is absent is left as-is; an empty array
   * clears it. Delete-and-recreate keeps this simple and correct - these rows
   * carry no state of their own that would be worth diffing.
   */
  async update(id: number, dto: UpdateContractRequestDto, user?: SessionUser) {
    const { children, scalars } = this.split(dto as CreateContractRequestDto);

    return this.db.$transaction(async (tx) => {
      // Fails (-> HTTP 404) when the contract does not exist or is soft-deleted. Also
      // doubles as the audit trail's "before" snapshot.
      const before = await tx.contract.findFirstOrThrow({
        where: { id, deleted: false },
        include: CONTRACT_INCLUDE,
      });

      if (Object.keys(scalars).length > 0) {
        await tx.contract.update({
          where: { id },
          data: this.toPrismaScalars(scalars) as Prisma.ContractUncheckedUpdateInput,
        });
      }

      if (children.completionDates) {
        await tx.contractCompletionDate.deleteMany({ where: { contractId: id } });
        if (children.completionDates.length > 0) {
          await tx.contractCompletionDate.createMany({
            data: children.completionDates.map((row) => ({ ...row, contractId: id })),
          });
        }
      }

      if (children.tags) {
        await tx.contractTagAssignment.deleteMany({ where: { contractId: id } });
        if (children.tags.length > 0) {
          await tx.contractTagAssignment.createMany({
            data: children.tags.map((row) => ({ ...row, contractId: id })),
          });
        }
      }

      if (children.urls) {
        await tx.contractUrl.deleteMany({ where: { contractId: id } });
        if (children.urls.length > 0) {
          await tx.contractUrl.createMany({
            data: children.urls.map((row) => ({ ...row, contractId: id })),
          });
        }
      }

      const after = await tx.contract.findUniqueOrThrow({ where: { id }, include: CONTRACT_INCLUDE });

      // A PATCH that changed nothing (e.g. an accidental double-submit of identical
      // values) leaves no audit trail - there is nothing to record.
      const changedFields = diffChangedFields(before, after);
      if (changedFields.length > 0) {
        await tx.contractAuditLog.create({
          data: buildAuditLogData('UPDATE', after, before, after, changedFields, user),
        });
      }

      return after;
    });
  }

  /**
   * Soft delete: flips `deleted` to `true` rather than removing the row. To every normal
   * reader (the list, the detail view, the MCP tools) this is indistinguishable from a
   * hard delete - the contract simply disappears. Nothing else is touched, so a restore
   * (see below) brings the contract and every child collection back exactly as they were.
   *
   * 404s (via `findFirstOrThrow`) when the contract does not exist or is already deleted -
   * same as a hard delete would have.
   */
  remove(id: number, user?: SessionUser) {
    return this.db.$transaction(async (tx) => {
      const before = await tx.contract.findFirstOrThrow({
        where: { id, deleted: false },
        include: CONTRACT_INCLUDE,
      });

      await tx.contract.update({ where: { id }, data: { deleted: true } });

      await tx.contractAuditLog.create({
        data: buildAuditLogData('DELETE', before, before, undefined, null, user),
      });

      return before;
    });
  }

  /**
   * Undoes a soft delete. Only ever reachable from the audit trail's DELETE entry, since
   * a restored contract is otherwise invisible everywhere else in the app.
   *
   * A restore can collide with `contractNumber`'s uniqueness if a new contract has since
   * reused the same number - surfaced as a 409 rather than the raw Prisma error.
   */
  async restore(id: number, user?: SessionUser) {
    return this.db.$transaction(async (tx) => {
      // Not filtered by `deleted` - this is the one place that must find the contract
      // regardless of its current state.
      const before = await tx.contract.findUniqueOrThrow({ where: { id }, include: CONTRACT_INCLUDE });

      if (!before.deleted) {
        throw new BadRequestException('This contract is not deleted');
      }

      try {
        await tx.contract.update({ where: { id }, data: { deleted: false } });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
          throw new ConflictException(
            'Cannot restore: another contract now uses this contract number',
          );
        }
        throw e;
      }

      const after = await tx.contract.findUniqueOrThrow({ where: { id }, include: CONTRACT_INCLUDE });

      await tx.contractAuditLog.create({
        data: buildAuditLogData('RESTORE', after, before, after, ['deleted'], user),
      });

      return after;
    });
  }

  // -------------------------------------------------------------------------
  // Payload plumbing
  // -------------------------------------------------------------------------

  /**
   * Splits the nested payload into contract scalars and normalised child rows.
   */
  private split(dto: CreateContractRequestDto) {
    const { completionDates, tags, urls, ...scalars } = dto;

    return {
      scalars: scalars as ContractScalarInput,
      children: {
        completionDates: completionDates?.map((row) => ({
          completionDate: new Date(row.completionDate),
          description: row.description ?? null,
        })),
        // Duplicate tags would trip the unique(contractId, tagId) index, so
        // collapse them here rather than returning a 409 for a harmless
        // double-click in the UI.
        tags: tags ? [...new Set(tags.map(toTagId))].map((tagId) => ({ tagId })) : undefined,
        urls: urls?.map((row) => ({
          urlTypeId: row.urlTypeId,
          description: row.description ?? null,
          url: row.url,
        })),
      },
    };
  }

  /** Converts the DTO's ISO date string into a Date for Prisma. */
  private toPrismaScalars(scalars: Partial<ContractScalarInput>) {
    const { awardDate, endDate, ...rest } = scalars;

    return {
      ...rest,
      ...(awardDate !== undefined ? { awardDate: new Date(awardDate) } : {}),
      ...(endDate !== undefined ? { endDate: endDate === null ? null : new Date(endDate) } : {}),
    };
  }
}
