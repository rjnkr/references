import { Injectable } from '@nestjs/common';
import { UrlType } from '@prisma/client';
import { DbService } from '../../database/db-service/db.service';
import { CreateUrlTypeDto } from '../../generated/nestjs-dto/create-urlType.dto';
import { UpdateUrlTypeDto } from '../../generated/nestjs-dto/update-urlType.dto';

@Injectable()
export class UrlTypesService {
  constructor(private readonly db: DbService) {}

  findAll(): Promise<UrlType[]> {
    return this.db.urlType.findMany({ orderBy: { name: 'asc' } });
  }

  findOne(id: number): Promise<UrlType> {
    return this.db.urlType.findUniqueOrThrow({ where: { id } });
  }

  create(data: CreateUrlTypeDto): Promise<UrlType> {
    delete data.id;
    return this.db.urlType.create({ data });
  }

  update(id: number, data: UpdateUrlTypeDto): Promise<UrlType> {
    delete data.id;
    return this.db.urlType.update({ where: { id }, data });
  }

  remove(id: number): Promise<UrlType> {
    return this.db.urlType.delete({ where: { id } });
  }
}
