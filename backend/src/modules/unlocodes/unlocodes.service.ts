import { Injectable } from '@nestjs/common';
import { Prisma, UnLocode } from '@prisma/client';
import { DbService } from '../../database/db-service/db.service';
import { CreateUnLocodeDto } from '../../generated/nestjs-dto/create-unLocode.dto';
import { UpdateUnLocodeDto } from '../../generated/nestjs-dto/update-unLocode.dto';

/** Cap on typeahead results - the full dataset can hold 100k+ locations. */
const SEARCH_LIMIT = 50;

@Injectable()
export class UnlocodesService {
  constructor(private readonly db: DbService) {}

  /**
   * Lists UN/LOCODEs, optionally filtered by a free text `search` term that
   * matches either the code or the location name (used by the frontend
   * typeahead). Results are capped when searching.
   */
  findAll(search?: string) {
    const where: Prisma.UnLocodeWhereInput = search
      ? {
          OR: [{ code: { contains: search } }, { name: { contains: search } }],
        }
      : {};

    return this.db.unLocode.findMany({
      where,
      include: { country: true },
      orderBy: [{ code: 'asc' }],
      take: search ? SEARCH_LIMIT : undefined,
    });
  }

  findOne(id: number) {
    return this.db.unLocode.findUniqueOrThrow({
      where: { id },
      include: { country: true },
    });
  }

  create(data: CreateUnLocodeDto): Promise<UnLocode> {
    delete data.id;
    return this.db.unLocode.create({ data: { ...data, code: data.code.toUpperCase() } });
  }

  update(id: number, data: UpdateUnLocodeDto): Promise<UnLocode> {
    delete data.id;
    return this.db.unLocode.update({
      where: { id },
      data: { ...data, code: data.code ? data.code.toUpperCase() : undefined },
    });
  }

  remove(id: number): Promise<UnLocode> {
    return this.db.unLocode.delete({ where: { id } });
  }
}
