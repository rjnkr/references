import { Injectable } from '@nestjs/common';
import { Currency } from '@prisma/client';
import { DbService } from '../../database/db-service/db.service';
import { CreateCurrencyDto } from '../../generated/nestjs-dto/create-currency.dto';
import { UpdateCurrencyDto } from '../../generated/nestjs-dto/update-currency.dto';

@Injectable()
export class CurrenciesService {
  constructor(private readonly db: DbService) {}

  findAll(): Promise<Currency[]> {
    return this.db.currency.findMany({ orderBy: { code: 'asc' } });
  }

  /** Throws Prisma P2025 (-> HTTP 404) when the id does not exist. */
  findOne(id: number): Promise<Currency> {
    return this.db.currency.findUniqueOrThrow({ where: { id } });
  }

  create(data: CreateCurrencyDto): Promise<Currency> {
    // The generated DTO exposes `id` so a previously fetched record can be
    // posted back unchanged; a client supplied value is always ignored.
    delete data.id;
    return this.db.currency.create({ data: { ...data, code: data.code.toUpperCase() } });
  }

  update(id: number, data: UpdateCurrencyDto): Promise<Currency> {
    delete data.id;
    return this.db.currency.update({
      where: { id },
      data: { ...data, code: data.code ? data.code.toUpperCase() : undefined },
    });
  }

  remove(id: number): Promise<Currency> {
    return this.db.currency.delete({ where: { id } });
  }
}
