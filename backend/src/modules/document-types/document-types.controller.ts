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
import { CreateDocumentTypeDto } from '../../generated/nestjs-dto/create-documentType.dto';
import { DocumentTypeDto } from '../../generated/nestjs-dto/documentType.dto';
import { UpdateDocumentTypeDto } from '../../generated/nestjs-dto/update-documentType.dto';
import { DocumentTypesService } from './document-types.service';

@Controller('document-types')
@ApiTags('Document types')
export class DocumentTypesController {
  constructor(private readonly documentTypesService: DocumentTypesService) {}

  @Get()
  @ApiOperation({ summary: 'List all document types' })
  @ApiOkResponse({ type: DocumentTypeDto, isArray: true })
  findAll() {
    return this.documentTypesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single document type' })
  @ApiOkResponse({ type: DocumentTypeDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.documentTypesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a document type' })
  @ApiOkResponse({ type: DocumentTypeDto })
  create(@Body() data: CreateDocumentTypeDto) {
    return this.documentTypesService.create(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a document type' })
  @ApiOkResponse({ type: DocumentTypeDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateDocumentTypeDto) {
    return this.documentTypesService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a document type' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.documentTypesService.remove(id);
  }
}
