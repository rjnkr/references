import { Injectable } from '@nestjs/common';
import { Product } from '@prisma/client';
import { DbService } from '../../database/db-service/db.service';
import { CreateProductDto } from '../../generated/nestjs-dto/create-product.dto';
import { UpdateProductDto } from '../../generated/nestjs-dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly db: DbService) {}

  findAll(): Promise<Product[]> {
    return this.db.product.findMany({ orderBy: { code: 'asc' } });
  }

  /** Throws Prisma P2025 (-> HTTP 404) when the id does not exist. */
  findOne(id: number): Promise<Product> {
    return this.db.product.findUniqueOrThrow({ where: { id } });
  }

  create(data: CreateProductDto): Promise<Product> {
    // The generated DTO exposes `id` so a previously fetched record can be
    // posted back unchanged; a client supplied value is always ignored.
    delete data.id;
    return this.db.product.create({ data: { ...data, code: data.code.toUpperCase() } });
  }

  update(id: number, data: UpdateProductDto): Promise<Product> {
    delete data.id;
    return this.db.product.update({
      where: { id },
      data: { ...data, code: data.code ? data.code.toUpperCase() : undefined },
    });
  }

  remove(id: number): Promise<Product> {
    return this.db.product.delete({ where: { id } });
  }
}
