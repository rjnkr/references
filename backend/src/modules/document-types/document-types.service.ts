import { Injectable } from '@nestjs/common';
import { DocumentType } from '@prisma/client';
import { DbService } from '../../database/db-service/db.service';
import { CreateDocumentTypeDto } from '../../generated/nestjs-dto/create-documentType.dto';
import { UpdateDocumentTypeDto } from '../../generated/nestjs-dto/update-documentType.dto';

@Injectable()
export class DocumentTypesService {
  constructor(private readonly db: DbService) {}

  findAll(): Promise<DocumentType[]> {
    return this.db.documentType.findMany({ orderBy: { name: 'asc' } });
  }

  findOne(id: number): Promise<DocumentType> {
    return this.db.documentType.findUniqueOrThrow({ where: { id } });
  }

  create(data: CreateDocumentTypeDto): Promise<DocumentType> {
    delete data.id;
    return this.db.documentType.create({ data });
  }

  update(id: number, data: UpdateDocumentTypeDto): Promise<DocumentType> {
    delete data.id;
    return this.db.documentType.update({ where: { id }, data });
  }

  remove(id: number): Promise<DocumentType> {
    return this.db.documentType.delete({ where: { id } });
  }
}
