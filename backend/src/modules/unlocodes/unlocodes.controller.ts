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
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateUnLocodeDto } from '../../generated/nestjs-dto/create-unLocode.dto';
import { UnLocodeDto } from '../../generated/nestjs-dto/unLocode.dto';
import { UpdateUnLocodeDto } from '../../generated/nestjs-dto/update-unLocode.dto';
import { UnlocodesService } from './unlocodes.service';

@Controller('unlocodes')
@ApiTags('UN/LOCODEs')
export class UnlocodesController {
  constructor(private readonly unlocodesService: UnlocodesService) {}

  @Get()
  @ApiOperation({
    summary: 'List UN/LOCODEs, optionally filtered for a typeahead',
    description:
      'Without `search` every location is returned. With `search` the code and the location name are matched and at most 50 results are returned.',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Matches code or location name' })
  @ApiOkResponse({ type: UnLocodeDto, isArray: true })
  findAll(@Query('search') search?: string) {
    return this.unlocodesService.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single UN/LOCODE' })
  @ApiOkResponse({ type: UnLocodeDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.unlocodesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a UN/LOCODE' })
  @ApiOkResponse({ type: UnLocodeDto })
  create(@Body() data: CreateUnLocodeDto) {
    return this.unlocodesService.create(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a UN/LOCODE' })
  @ApiOkResponse({ type: UnLocodeDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateUnLocodeDto) {
    return this.unlocodesService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a UN/LOCODE' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.unlocodesService.remove(id);
  }
}
