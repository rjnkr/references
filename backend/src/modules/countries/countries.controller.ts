import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CountryDto } from '../../generated/nestjs-dto/country.dto';
import { CreateCountryDto } from '../../generated/nestjs-dto/create-country.dto';
import { UpdateCountryDto } from '../../generated/nestjs-dto/update-country.dto';
import { CountriesService } from './countries.service';

@Controller('countries')
@ApiTags('Countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all countries' })
  @ApiOkResponse({ type: CountryDto, isArray: true })
  findAll() {
    return this.countriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single country' })
  @ApiOkResponse({ type: CountryDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.countriesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a country' })
  @ApiOkResponse({ type: CountryDto })
  create(@Body() data: CreateCountryDto) {
    return this.countriesService.create(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a country' })
  @ApiOkResponse({ type: CountryDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateCountryDto) {
    return this.countriesService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a country' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.countriesService.remove(id);
  }
}
