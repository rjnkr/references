import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DbService } from '../../database/db-service/db.service';
import { SessionUser } from '../../core/decorators/current-user.decorator';
import { toTagId } from '../../core/validators/loose-array.validator';
import { buildAuditLogData, diffChangedFields } from './audit-log.util';
import { CreateProjectRequestDto } from './dto/create-project-request.dto';
import { QueryProjectsDto, SORTABLE_PROJECT_FIELDS } from './dto/query-projects.dto';
import { UpdateProjectRequestDto } from './dto/update-project-request.dto';

/**
 * Everything the frontend list and detail views need, so neither has to make a
 * second round-trip. Shared with the MCP server.
 */
export const PROJECT_INCLUDE = {
  currency: true,
  system: true,
  completionDates: { orderBy: { completionDate: 'asc' } },
  documents: { include: { documentType: true }, orderBy: { uploadedAt: 'desc' } },
  tags: { include: { tag: true }, orderBy: { tag: { name: 'asc' } } },
  urls: { include: { urlType: true } },
} satisfies Prisma.ProjectInclude;

/** The project payload minus the child collections. */
type ProjectScalarInput = Omit<CreateProjectRequestDto, 'completionDates' | 'tags' | 'urls'>;

/** The fully expanded project shape returned by every read/write below - also what
 *  gets snapshotted into `ProjectAuditLog.beforeData`/`afterData`. */
export type ExpandedProject = Prisma.ProjectGetPayload<{ include: typeof PROJECT_INCLUDE }>;

@Injectable()
export class ProjectsService {
  constructor(private readonly db: DbService) {}

  // -------------------------------------------------------------------------
  // Reads
  // -------------------------------------------------------------------------

  /**
   * Paginated, filtered list. Returns `{ data, total }` where every item is
   * the fully expanded project (lookups + all child collections).
   */
  async findAll(query: QueryProjectsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 25;

    const where = this.buildWhere(query);
    const orderBy = this.buildOrderBy(query.sort);

    const [data, total] = await this.db.$transaction([
      this.db.project.findMany({
        where,
        include: PROJECT_INCLUDE,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.db.project.count({ where }),
    ]);

    return { data, total };
  }

  /** A soft-deleted project 404s here exactly as a hard-deleted one used to. */
  findOne(id: number) {
    return this.db.project.findFirstOrThrow({ where: { id, deleted: false }, include: PROJECT_INCLUDE });
  }

  findByProjectNumber(projectNumber: string) {
    return this.db.project.findFirstOrThrow({
      where: { projectNumber, deleted: false },
      include: PROJECT_INCLUDE,
    });
  }

  private buildWhere(query: QueryProjectsDto): Prisma.ProjectWhereInput {
    // Soft-deleted projects never surface through the normal API - only their audit
    // trail entry remains, from where they can be restored.
    const where: Prisma.ProjectWhereInput = { deleted: false };

    if (query.search) {
      where.OR = [
        { projectNumber: { contains: query.search } },
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

  /** `sort=projectNumber` ascending, `sort=-awardDate` descending. */
  private buildOrderBy(sort?: string): Prisma.ProjectOrderByWithRelationInput {
    if (!sort) {
      return { awardDate: 'desc' };
    }

    const descending = sort.startsWith('-');
    const field = descending ? sort.slice(1) : sort;

    if (!(SORTABLE_PROJECT_FIELDS as readonly string[]).includes(field)) {
      throw new BadRequestException(
        `Cannot sort on "${field}". Allowed fields: ${SORTABLE_PROJECT_FIELDS.join(', ')}`,
      );
    }

    return { [field]: descending ? 'desc' : 'asc' } as Prisma.ProjectOrderByWithRelationInput;
  }

  // -------------------------------------------------------------------------
  // Writes
  // -------------------------------------------------------------------------

  /**
   * Creates the project and every supplied child row in one transaction. The audit
   * entry is written in the same transaction, so a project is never created without
   * one (and vice versa).
   */
  async create(dto: CreateProjectRequestDto, user?: SessionUser) {
    const { children, scalars } = this.split(dto);

    return this.db.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          ...(this.toPrismaScalars(scalars) as Prisma.ProjectUncheckedCreateInput),
          completionDates: children.completionDates
            ? { create: children.completionDates }
            : undefined,
          tags: children.tags ? { create: children.tags } : undefined,
          urls: children.urls ? { create: children.urls } : undefined,
        },
        select: { id: true },
      });

      const full = await tx.project.findUniqueOrThrow({
        where: { id: created.id },
        include: PROJECT_INCLUDE,
      });

      await tx.projectAuditLog.create({
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
  async update(id: number, dto: UpdateProjectRequestDto, user?: SessionUser) {
    const { children, scalars } = this.split(dto as CreateProjectRequestDto);

    return this.db.$transaction(async (tx) => {
      // Fails (-> HTTP 404) when the project does not exist or is soft-deleted. Also
      // doubles as the audit trail's "before" snapshot.
      const before = await tx.project.findFirstOrThrow({
        where: { id, deleted: false },
        include: PROJECT_INCLUDE,
      });

      if (Object.keys(scalars).length > 0) {
        await tx.project.update({
          where: { id },
          data: this.toPrismaScalars(scalars) as Prisma.ProjectUncheckedUpdateInput,
        });
      }

      if (children.completionDates) {
        await tx.projectCompletionDate.deleteMany({ where: { projectId: id } });
        if (children.completionDates.length > 0) {
          await tx.projectCompletionDate.createMany({
            data: children.completionDates.map((row) => ({ ...row, projectId: id })),
          });
        }
      }

      if (children.tags) {
        await tx.projectTagAssignment.deleteMany({ where: { projectId: id } });
        if (children.tags.length > 0) {
          await tx.projectTagAssignment.createMany({
            data: children.tags.map((row) => ({ ...row, projectId: id })),
          });
        }
      }

      if (children.urls) {
        await tx.projectUrl.deleteMany({ where: { projectId: id } });
        if (children.urls.length > 0) {
          await tx.projectUrl.createMany({
            data: children.urls.map((row) => ({ ...row, projectId: id })),
          });
        }
      }

      const after = await tx.project.findUniqueOrThrow({ where: { id }, include: PROJECT_INCLUDE });

      // A PATCH that changed nothing (e.g. an accidental double-submit of identical
      // values) leaves no audit trail - there is nothing to record.
      const changedFields = diffChangedFields(before, after);
      if (changedFields.length > 0) {
        await tx.projectAuditLog.create({
          data: buildAuditLogData('UPDATE', after, before, after, changedFields, user),
        });
      }

      return after;
    });
  }

  /**
   * Soft delete: flips `deleted` to `true` rather than removing the row. To every normal
   * reader (the list, the detail view, the MCP tools) this is indistinguishable from a
   * hard delete - the project simply disappears. Nothing else is touched, so a restore
   * (see below) brings the project and every child collection back exactly as they were.
   *
   * 404s (via `findFirstOrThrow`) when the project does not exist or is already deleted -
   * same as a hard delete would have.
   */
  remove(id: number, user?: SessionUser) {
    return this.db.$transaction(async (tx) => {
      const before = await tx.project.findFirstOrThrow({
        where: { id, deleted: false },
        include: PROJECT_INCLUDE,
      });

      await tx.project.update({ where: { id }, data: { deleted: true } });

      await tx.projectAuditLog.create({
        data: buildAuditLogData('DELETE', before, before, undefined, null, user),
      });

      return before;
    });
  }

  /**
   * Undoes a soft delete. Only ever reachable from the audit trail's DELETE entry, since
   * a restored project is otherwise invisible everywhere else in the app.
   *
   * A restore can collide with `projectNumber`'s uniqueness if a new project has since
   * reused the same number - surfaced as a 409 rather than the raw Prisma error.
   */
  async restore(id: number, user?: SessionUser) {
    return this.db.$transaction(async (tx) => {
      // Not filtered by `deleted` - this is the one place that must find the project
      // regardless of its current state.
      const before = await tx.project.findUniqueOrThrow({ where: { id }, include: PROJECT_INCLUDE });

      if (!before.deleted) {
        throw new BadRequestException('This project is not deleted');
      }

      try {
        await tx.project.update({ where: { id }, data: { deleted: false } });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
          throw new ConflictException(
            'Cannot restore: another project now uses this project number',
          );
        }
        throw e;
      }

      const after = await tx.project.findUniqueOrThrow({ where: { id }, include: PROJECT_INCLUDE });

      await tx.projectAuditLog.create({
        data: buildAuditLogData('RESTORE', after, before, after, ['deleted'], user),
      });

      return after;
    });
  }

  // -------------------------------------------------------------------------
  // Payload plumbing
  // -------------------------------------------------------------------------

  /**
   * Splits the nested payload into project scalars and normalised child rows.
   */
  private split(dto: CreateProjectRequestDto) {
    const { completionDates, tags, urls, ...scalars } = dto;

    return {
      scalars: scalars as ProjectScalarInput,
      children: {
        completionDates: completionDates?.map((row) => ({
          completionDate: new Date(row.completionDate),
          description: row.description ?? null,
        })),
        // Duplicate tags would trip the unique(projectId, tagId) index, so
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
  private toPrismaScalars(scalars: Partial<ProjectScalarInput>) {
    const { awardDate, endDate, ...rest } = scalars;

    return {
      ...rest,
      ...(awardDate !== undefined ? { awardDate: new Date(awardDate) } : {}),
      ...(endDate !== undefined ? { endDate: endDate === null ? null : new Date(endDate) } : {}),
    };
  }
}
