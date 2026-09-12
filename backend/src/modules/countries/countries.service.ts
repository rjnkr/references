import { Injectable } from '@nestjs/common';
import { Country } from '@prisma/client';
import { DbService } from '../../database/db-service/db.service';
import { CreateCountryDto } from '../../generated/nestjs-dto/create-country.dto';
import { UpdateCountryDto } from '../../generated/nestjs-dto/update-country.dto';

@Injectable()
export class CountriesService {
  constructor(private readonly db: DbService) {}

  findAll(): Promise<Country[]> {
    return this.db.country.findMany({ orderBy: { name: 'asc' } });
  }

  findOne(id: number): Promise<Country> {
    return this.db.country.findUniqueOrThrow({ where: { id } });
  }

  create(data: CreateCountryDto): Promise<Country> {
    delete data.id;
    return this.db.country.create({ data: { ...data, isoCode: data.isoCode.toUpperCase() } });
  }

  update(id: number, data: UpdateCountryDto): Promise<Country> {
    delete data.id;
    return this.db.country.update({
      where: { id },
      data: { ...data, isoCode: data.isoCode ? data.isoCode.toUpperCase() : undefined },
    });
  }

  remove(id: number): Promise<Country> {
    return this.db.country.delete({ where: { id } });
  }
}
