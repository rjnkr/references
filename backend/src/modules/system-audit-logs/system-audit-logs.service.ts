import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DbService } from '../../database/db-service/db.service';
import { QuerySystemAuditLogsDto } from './dto/query-system-audit-logs.dto';

@Injectable()
export class SystemAuditLogsService {
  constructor(private readonly db: DbService) {}

  async findAll(query: QuerySystemAuditLogsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 25;
    const where = this.buildWhere(query);

    const [data, total] = await this.db.$transaction([
      this.db.systemAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.db.systemAuditLog.count({ where }),
    ]);

    return { data, total };
  }

  findOne(id: number) {
    return this.db.systemAuditLog.findUniqueOrThrow({ where: { id } });
  }

  private buildWhere(query: QuerySystemAuditLogsDto): Prisma.SystemAuditLogWhereInput {
    const where: Prisma.SystemAuditLogWhereInput = {};

    if (query.systemId !== undefined) {
      where.systemId = query.systemId;
    }
    if (query.action !== undefined) {
      where.action = query.action;
    }
    if (query.search) {
      where.OR = [
        { systemName: { contains: query.search } },
        { userEmail: { contains: query.search } },
        { userName: { contains: query.search } },
      ];
    }

    return where;
  }
}
