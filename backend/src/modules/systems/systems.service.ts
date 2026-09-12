import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DbService } from '../../database/db-service/db.service';
import { toModuleId, toName, toTagId, toUnlocodeId } from '../../core/validators/loose-array.validator';
import { SessionUser } from '../../core/decorators/current-user.decorator';
import { buildAuditLogData, diffChangedFields } from './audit-log.util';
import { CreateSystemRequestDto } from './dto/create-system-request.dto';
import { QuerySystemsDto, SORTABLE_SYSTEM_FIELDS } from './dto/query-systems.dto';
import { UpdateSystemRequestDto } from './dto/update-system-request.dto';

/**
 * Everything the frontend list and detail views need, so neither has to make a
 * second round-trip. Shared with the MCP server.
 */
export const SYSTEM_INCLUDE = {
  country: true,
  systemUnlocode: { include: { country: true } },
  ports: { include: { unlocode: { include: { country: true } } } },
  modules: { include: { module: true }, orderBy: { module: { name: 'asc' } } },
  subSystems: { orderBy: { name: 'asc' } },
  externalInterfaces: { orderBy: { name: 'asc' } },
  people: { orderBy: { name: 'asc' } },
  documents: { include: { documentType: true }, orderBy: { uploadedAt: 'desc' } },
  tags: { include: { tag: true }, orderBy: { tag: { name: 'asc' } } },
  urls: { include: { urlType: true } },
} satisfies Prisma.SystemInclude;

/** The system payload minus the child collections. */
type SystemScalarInput = Omit<
  CreateSystemRequestDto,
  'ports' | 'modules' | 'subSystems' | 'externalInterfaces' | 'people' | 'tags' | 'urls'
>;

/** The fully expanded system shape returned by every read/write below - also what
 *  gets snapshotted into `SystemAuditLog.beforeData`/`afterData`. */
export type ExpandedSystem = Prisma.SystemGetPayload<{ include: typeof SYSTEM_INCLUDE }>;

@Injectable()
export class SystemsService {
  constructor(private readonly db: DbService) {}

  // -------------------------------------------------------------------------
  // Reads
  // -------------------------------------------------------------------------

  /**
   * Paginated, filtered list. Returns `{ data, total }` where every item is
   * the fully expanded system (lookups + all child collections).
   */
  async findAll(query: QuerySystemsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 25;

    const where = this.buildWhere(query);
    const orderBy = this.buildOrderBy(query.sort);

    const [data, total] = await this.db.$transaction([
      this.db.system.findMany({
        where,
        include: SYSTEM_INCLUDE,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.db.system.count({ where }),
    ]);

    return { data, total };
  }

  /** A soft-deleted system 404s here exactly as a hard-deleted one used to. */
  findOne(id: number) {
    return this.db.system.findFirstOrThrow({ where: { id, deleted: false }, include: SYSTEM_INCLUDE });
  }

  private buildWhere(query: QuerySystemsDto): Prisma.SystemWhereInput {
    // Soft-deleted systems never surface through the normal API - only their audit
    // trail entry remains, from where they can be restored.
    const where: Prisma.SystemWhereInput = { deleted: false };

    if (query.search) {
      where.OR = [{ name: { contains: query.search } }, { products: { contains: query.search } }];
    }
    if (query.projectType !== undefined) {
      where.projectType = query.projectType;
    }
    if (query.countryId !== undefined) {
      where.countryId = query.countryId;
    }
    if (query.isSensitive !== undefined) {
      where.isSensitive = query.isSensitive;
    }
    if (query.canBeUsedAsReference !== undefined) {
      where.canBeUsedAsReference = query.canBeUsedAsReference;
    }
    if (query.systemDecommissioned !== undefined) {
      where.systemDecommissioned = query.systemDecommissioned;
    }

    return where;
  }

  /** `sort=name` ascending, `sort=-createdAt` descending. */
  private buildOrderBy(sort?: string): Prisma.SystemOrderByWithRelationInput {
    if (!sort) {
      return { name: 'asc' };
    }

    const descending = sort.startsWith('-');
    const field = descending ? sort.slice(1) : sort;

    if (!(SORTABLE_SYSTEM_FIELDS as readonly string[]).includes(field)) {
      throw new BadRequestException(
        `Cannot sort on "${field}". Allowed fields: ${SORTABLE_SYSTEM_FIELDS.join(', ')}`,
      );
    }

    return { [field]: descending ? 'desc' : 'asc' } as Prisma.SystemOrderByWithRelationInput;
  }

  // -------------------------------------------------------------------------
  // Writes
  // -------------------------------------------------------------------------

  /**
   * Creates the system and every supplied child row in one transaction. The audit
   * entry is written in the same transaction, so a system is never created without
   * one (and vice versa).
   */
  async create(dto: CreateSystemRequestDto, user?: SessionUser) {
    const { children, scalars } = this.split(dto);

    return this.db.$transaction(async (tx) => {
      const created = await tx.system.create({
        data: {
          ...(scalars as Prisma.SystemUncheckedCreateInput),
          ports: children.ports ? { create: children.ports } : undefined,
          modules: children.modules ? { create: children.modules } : undefined,
          subSystems: children.subSystems ? { create: children.subSystems } : undefined,
          externalInterfaces: children.externalInterfaces
            ? { create: children.externalInterfaces }
            : undefined,
          people: children.people ? { create: children.people } : undefined,
          tags: children.tags ? { create: children.tags } : undefined,
          urls: children.urls ? { create: children.urls } : undefined,
        },
        select: { id: true },
      });

      const full = await tx.system.findUniqueOrThrow({
        where: { id: created.id },
        include: SYSTEM_INCLUDE,
      });

      await tx.systemAuditLog.create({
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
  async update(id: number, dto: UpdateSystemRequestDto, user?: SessionUser) {
    const { children, scalars } = this.split(dto as CreateSystemRequestDto);

    return this.db.$transaction(async (tx) => {
      // Fails (-> HTTP 404) when the system does not exist or is soft-deleted. Also
      // doubles as the audit trail's "before" snapshot.
      const before = await tx.system.findFirstOrThrow({
        where: { id, deleted: false },
        include: SYSTEM_INCLUDE,
      });

      if (Object.keys(scalars).length > 0) {
        await tx.system.update({
          where: { id },
          data: scalars as Prisma.SystemUncheckedUpdateInput,
        });
      }

      if (children.ports) {
        await tx.systemPort.deleteMany({ where: { systemId: id } });
        if (children.ports.length > 0) {
          await tx.systemPort.createMany({
            data: children.ports.map((row) => ({ ...row, systemId: id })),
          });
        }
      }

      if (children.modules) {
        await tx.systemModule.deleteMany({ where: { systemId: id } });
        if (children.modules.length > 0) {
          await tx.systemModule.createMany({
            data: children.modules.map((row) => ({ ...row, systemId: id })),
          });
        }
      }

      if (children.subSystems) {
        await tx.systemSubSystem.deleteMany({ where: { systemId: id } });
        if (children.subSystems.length > 0) {
          await tx.systemSubSystem.createMany({
            data: children.subSystems.map((row) => ({ ...row, systemId: id })),
          });
        }
      }

      if (children.externalInterfaces) {
        await tx.systemExternalInterface.deleteMany({ where: { systemId: id } });
        if (children.externalInterfaces.length > 0) {
          await tx.systemExternalInterface.createMany({
            data: children.externalInterfaces.map((row) => ({ ...row, systemId: id })),
          });
        }
      }

      if (children.people) {
        await tx.systemPerson.deleteMany({ where: { systemId: id } });
        if (children.people.length > 0) {
          await tx.systemPerson.createMany({
            data: children.people.map((row) => ({ ...row, systemId: id })),
          });
        }
      }

      if (children.tags) {
        await tx.systemTagAssignment.deleteMany({ where: { systemId: id } });
        if (children.tags.length > 0) {
          await tx.systemTagAssignment.createMany({
            data: children.tags.map((row) => ({ ...row, systemId: id })),
          });
        }
      }

      if (children.urls) {
        await tx.systemUrl.deleteMany({ where: { systemId: id } });
        if (children.urls.length > 0) {
          await tx.systemUrl.createMany({
            data: children.urls.map((row) => ({ ...row, systemId: id })),
          });
        }
      }

      const after = await tx.system.findUniqueOrThrow({ where: { id }, include: SYSTEM_INCLUDE });

      // A PATCH that changed nothing (e.g. an accidental double-submit of identical
      // values) leaves no audit trail - there is nothing to record.
      const changedFields = diffChangedFields(before, after);
      if (changedFields.length > 0) {
        await tx.systemAuditLog.create({
          data: buildAuditLogData('UPDATE', after, before, after, changedFields, user),
        });
      }

      return after;
    });
  }

  /**
   * Soft delete: flips `deleted` to `true` rather than removing the row. To every normal
   * reader (the list, the detail view, the map, the MCP tools) this is indistinguishable
   * from a hard delete - the system simply disappears. Nothing else is touched, so a
   * restore (see below) brings the system, its documents and every child collection
   * back exactly as they were.
   *
   * 404s (via `findFirstOrThrow`) when the system does not exist or is already deleted -
   * same as a hard delete would have.
   */
  remove(id: number, user?: SessionUser) {
    return this.db.$transaction(async (tx) => {
      const before = await tx.system.findFirstOrThrow({
        where: { id, deleted: false },
        include: SYSTEM_INCLUDE,
      });

      await tx.system.update({ where: { id }, data: { deleted: true } });

      await tx.systemAuditLog.create({
        data: buildAuditLogData('DELETE', before, before, undefined, null, user),
      });

      return before;
    });
  }

  /**
   * Undoes a soft delete. Only ever reachable from the audit trail's DELETE entry, since
   * a restored system is otherwise invisible everywhere else in the app.
   */
  async restore(id: number, user?: SessionUser) {
    return this.db.$transaction(async (tx) => {
      // Not filtered by `deleted` - this is the one place that must find the system
      // regardless of its current state.
      const before = await tx.system.findUniqueOrThrow({ where: { id }, include: SYSTEM_INCLUDE });

      if (!before.deleted) {
        throw new BadRequestException('This system is not deleted');
      }

      await tx.system.update({ where: { id }, data: { deleted: false } });

      const after = await tx.system.findUniqueOrThrow({ where: { id }, include: SYSTEM_INCLUDE });

      await tx.systemAuditLog.create({
        data: buildAuditLogData('RESTORE', after, before, after, ['deleted'], user),
      });

      return after;
    });
  }

  // -------------------------------------------------------------------------
  // Payload plumbing
  // -------------------------------------------------------------------------

  /**
   * Splits the nested payload into system scalars and normalised child rows.
   * The two accepted shapes for ports/modules/subSystems collapse here.
   */
  private split(dto: CreateSystemRequestDto) {
    const { ports, modules, subSystems, externalInterfaces, people, tags, urls, ...scalars } = dto;

    return {
      scalars: scalars as SystemScalarInput,
      children: {
        // Duplicate ports would trip the unique(systemId, unlocodeId) index,
        // so collapse them here rather than returning a 409 for a harmless
        // double-click in the UI.
        ports: ports
          ? [...new Set(ports.map(toUnlocodeId))].map((unlocodeId) => ({ unlocodeId }))
          : undefined,
        // Duplicate modules would trip the unique(systemId, moduleId) index, so
        // collapse them here rather than returning a 409 for a harmless
        // double-click in the UI.
        modules: modules
          ? [...new Set(modules.map(toModuleId))].map((moduleId) => ({ moduleId }))
          : undefined,
        subSystems: subSystems?.map((row) => ({ name: toName(row) })),
        externalInterfaces: externalInterfaces?.map((row) => ({
          name: row.name,
          description: row.description ?? null,
        })),
        people: people?.map((row) => ({
          name: row.name,
          role: row.role,
          email: row.email ?? null,
        })),
        // Duplicate tags would trip the unique(systemId, tagId) index, so
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
}
