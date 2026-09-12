import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DbService } from '../../database/db-service/db.service';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';

@Injectable()
export class AuditLogsService {
  constructor(private readonly db: DbService) {}

  async findAll(query: QueryAuditLogsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 25;
    const where = this.buildWhere(query);

    const [data, total] = await this.db.$transaction([
      this.db.projectAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.db.projectAuditLog.count({ where }),
    ]);

    return { data, total };
  }

  findOne(id: number) {
    return this.db.projectAuditLog.findUniqueOrThrow({ where: { id } });
  }

  private buildWhere(query: QueryAuditLogsDto): Prisma.ProjectAuditLogWhereInput {
    const where: Prisma.ProjectAuditLogWhereInput = {};

    if (query.projectId !== undefined) {
      where.projectId = query.projectId;
    }
    if (query.action !== undefined) {
      where.action = query.action;
    }
    if (query.search) {
      where.OR = [
        { projectName: { contains: query.search } },
        { projectNumber: { contains: query.search } },
        { userEmail: { contains: query.search } },
        { userName: { contains: query.search } },
      ];
    }

    return where;
  }
}
