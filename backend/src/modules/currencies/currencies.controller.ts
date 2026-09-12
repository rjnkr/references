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
import { CreateCurrencyDto } from '../../generated/nestjs-dto/create-currency.dto';
import { CurrencyDto } from '../../generated/nestjs-dto/currency.dto';
import { UpdateCurrencyDto } from '../../generated/nestjs-dto/update-currency.dto';
import { CurrenciesService } from './currencies.service';

@Controller('currencies')
@ApiTags('Currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get()
  @ApiOperation({ summary: 'List all currencies' })
  @ApiOkResponse({ type: CurrencyDto, isArray: true })
  findAll() {
    return this.currenciesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single currency' })
  @ApiOkResponse({ type: CurrencyDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.currenciesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a currency' })
  @ApiOkResponse({ type: CurrencyDto })
  create(@Body() data: CreateCurrencyDto) {
    return this.currenciesService.create(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a currency' })
  @ApiOkResponse({ type: CurrencyDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateCurrencyDto) {
    return this.currenciesService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a currency' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.currenciesService.remove(id);
  }
}
