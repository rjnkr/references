import { Injectable } from '@nestjs/common';
import { Tag } from '@prisma/client';
import { DbService } from '../../database/db-service/db.service';
import { CreateTagDto } from '../../generated/nestjs-dto/create-tag.dto';
import { UpdateTagDto } from '../../generated/nestjs-dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly db: DbService) {}

  findAll(): Promise<Tag[]> {
    return this.db.tag.findMany({ orderBy: { name: 'asc' } });
  }

  findOne(id: number): Promise<Tag> {
    return this.db.tag.findUniqueOrThrow({ where: { id } });
  }

  create(data: CreateTagDto): Promise<Tag> {
    delete data.id;
    return this.db.tag.create({ data });
  }

  update(id: number, data: UpdateTagDto): Promise<Tag> {
    delete data.id;
    return this.db.tag.update({ where: { id }, data });
  }

  remove(id: number): Promise<Tag> {
    return this.db.tag.delete({ where: { id } });
  }
}
