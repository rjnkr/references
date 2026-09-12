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
import { CreateTagDto } from '../../generated/nestjs-dto/create-tag.dto';
import { TagDto } from '../../generated/nestjs-dto/tag.dto';
import { UpdateTagDto } from '../../generated/nestjs-dto/update-tag.dto';
import { TagsService } from './tags.service';

@Controller('tags')
@ApiTags('Tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'List all tags' })
  @ApiOkResponse({ type: TagDto, isArray: true })
  findAll() {
    return this.tagsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single tag' })
  @ApiOkResponse({ type: TagDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a tag' })
  @ApiOkResponse({ type: TagDto })
  create(@Body() data: CreateTagDto) {
    return this.tagsService.create(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tag' })
  @ApiOkResponse({ type: TagDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateTagDto) {
    return this.tagsService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a tag' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.tagsService.remove(id);
  }
}
