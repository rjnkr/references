import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DbService } from '../../database/db-service/db.service';
import { QueryContractAuditLogsDto } from './dto/query-contract-audit-logs.dto';

@Injectable()
export class ContractAuditLogsService {
  constructor(private readonly db: DbService) {}

  async findAll(query: QueryContractAuditLogsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 25;
    const where = this.buildWhere(query);

    const [data, total] = await this.db.$transaction([
      this.db.contractAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.db.contractAuditLog.count({ where }),
    ]);

    return { data, total };
  }

  findOne(id: number) {
    return this.db.contractAuditLog.findUniqueOrThrow({ where: { id } });
  }

  private buildWhere(query: QueryContractAuditLogsDto): Prisma.ContractAuditLogWhereInput {
    const where: Prisma.ContractAuditLogWhereInput = {};

    if (query.contractId !== undefined) {
      where.contractId = query.contractId;
    }
    if (query.action !== undefined) {
      where.action = query.action;
    }
    if (query.search) {
      where.OR = [
        { contractName: { contains: query.search } },
        { contractNumber: { contains: query.search } },
        { userEmail: { contains: query.search } },
        { userName: { contains: query.search } },
      ];
    }

    return where;
  }
}
