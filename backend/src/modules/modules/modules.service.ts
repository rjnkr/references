import { Injectable } from '@nestjs/common';
import { Module as ModuleLookup } from '@prisma/client';
import { DbService } from '../../database/db-service/db.service';
import { CreateModuleDto } from '../../generated/nestjs-dto/create-module.dto';
import { UpdateModuleDto } from '../../generated/nestjs-dto/update-module.dto';

@Injectable()
export class ModulesService {
  constructor(private readonly db: DbService) {}

  findAll(): Promise<ModuleLookup[]> {
    return this.db.module.findMany({ orderBy: { name: 'asc' } });
  }

  findOne(id: number): Promise<ModuleLookup> {
    return this.db.module.findUniqueOrThrow({ where: { id } });
  }

  create(data: CreateModuleDto): Promise<ModuleLookup> {
    delete data.id;
    return this.db.module.create({ data });
  }

  update(id: number, data: UpdateModuleDto): Promise<ModuleLookup> {
    delete data.id;
    return this.db.module.update({ where: { id }, data });
  }

  remove(id: number): Promise<ModuleLookup> {
    return this.db.module.delete({ where: { id } });
  }
}
