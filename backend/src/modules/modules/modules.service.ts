import { Injectable } from '@nestjs/common';
import { Module as ModuleLookup, Prisma, Product } from '@prisma/client';
import { DbService } from '../../database/db-service/db.service';
import { CreateModuleRequestDto, UpdateModuleRequestDto } from './dto/module-request.dto';
import { ModuleResponseDto } from './dto/module-response.dto';

const MODULE_INCLUDE = {
  products: { include: { product: true }, orderBy: { product: { code: 'asc' } } },
} satisfies Prisma.ModuleInclude;

type ModuleWithProducts = ModuleLookup & { products: { product: Product }[] };

@Injectable()
export class ModulesService {
  constructor(private readonly db: DbService) {}

  async findAll(): Promise<ModuleResponseDto[]> {
    const rows = await this.db.module.findMany({ include: MODULE_INCLUDE, orderBy: { name: 'asc' } });
    return rows.map(toResponse);
  }

  async findOne(id: number): Promise<ModuleResponseDto> {
    return toResponse(await this.db.module.findUniqueOrThrow({ where: { id }, include: MODULE_INCLUDE }));
  }

  async create(data: CreateModuleRequestDto): Promise<ModuleResponseDto> {
    const { productIds, name } = data;
    const row = await this.db.module.create({
      data: {
        name,
        products: productIds?.length ? { create: uniqueIds(productIds).map((productId) => ({ productId })) } : undefined,
      },
      include: MODULE_INCLUDE,
    });
    return toResponse(row);
  }

  async update(id: number, data: UpdateModuleRequestDto): Promise<ModuleResponseDto> {
    const { productIds, name } = data;
    const row = await this.db.module.update({
      where: { id },
      data: {
        name,
        // Sending productIds replaces the whole set; leaving it out keeps it.
        products: productIds
          ? { deleteMany: {}, create: uniqueIds(productIds).map((productId) => ({ productId })) }
          : undefined,
      },
      include: MODULE_INCLUDE,
    });
    return toResponse(row);
  }

  remove(id: number): Promise<ModuleLookup> {
    return this.db.module.delete({ where: { id } });
  }
}

// Duplicate ids would trip the unique(moduleId, productId) index.
function uniqueIds(ids: number[]): number[] {
  return [...new Set(ids)];
}

function toResponse(row: ModuleWithProducts): ModuleResponseDto {
  const products = row.products.map((link) => link.product);
  return { id: row.id, name: row.name, productIds: products.map((p) => p.id), products };
}
