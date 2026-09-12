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
import { CreateUrlTypeDto } from '../../generated/nestjs-dto/create-urlType.dto';
import { UrlTypeDto } from '../../generated/nestjs-dto/urlType.dto';
import { UpdateUrlTypeDto } from '../../generated/nestjs-dto/update-urlType.dto';
import { UrlTypesService } from './url-types.service';

@Controller('url-types')
@ApiTags('URL types')
export class UrlTypesController {
  constructor(private readonly urlTypesService: UrlTypesService) {}

  @Get()
  @ApiOperation({ summary: 'List all URL types' })
  @ApiOkResponse({ type: UrlTypeDto, isArray: true })
  findAll() {
    return this.urlTypesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single URL type' })
  @ApiOkResponse({ type: UrlTypeDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.urlTypesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a URL type' })
  @ApiOkResponse({ type: UrlTypeDto })
  create(@Body() data: CreateUrlTypeDto) {
    return this.urlTypesService.create(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a URL type' })
  @ApiOkResponse({ type: UrlTypeDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateUrlTypeDto) {
    return this.urlTypesService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a URL type' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.urlTypesService.remove(id);
  }
}
