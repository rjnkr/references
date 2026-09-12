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
import { CreateModuleDto } from '../../generated/nestjs-dto/create-module.dto';
import { ModuleDto } from '../../generated/nestjs-dto/module.dto';
import { UpdateModuleDto } from '../../generated/nestjs-dto/update-module.dto';
import { ModulesService } from './modules.service';

@Controller('modules')
@ApiTags('Modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get()
  @ApiOperation({ summary: 'List all modules' })
  @ApiOkResponse({ type: ModuleDto, isArray: true })
  findAll() {
    return this.modulesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single module' })
  @ApiOkResponse({ type: ModuleDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.modulesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a module' })
  @ApiOkResponse({ type: ModuleDto })
  create(@Body() data: CreateModuleDto) {
    return this.modulesService.create(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a module' })
  @ApiOkResponse({ type: ModuleDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateModuleDto) {
    return this.modulesService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a module' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.modulesService.remove(id);
  }
}
