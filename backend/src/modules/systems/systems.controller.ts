import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, SessionUser } from '../../core/decorators/current-user.decorator';
import { CreateSystemRequestDto } from './dto/create-system-request.dto';
import { ExpandedSystemDto, SystemListResponseDto } from './dto/expanded-system.dto';
import { QuerySystemsDto } from './dto/query-systems.dto';
import { UpdateSystemRequestDto } from './dto/update-system-request.dto';
import { SystemsService } from './systems.service';

@Controller('systems')
@ApiTags('Systems')
export class SystemsController {
  private readonly logger = new Logger(SystemsController.name);

  constructor(private readonly systemsService: SystemsService) {}

  @Get()
  @ApiOperation({
    summary: 'List systems',
    description:
      'Filtered, sorted and paginated list. Every item is fully expanded (country, UN/LOCODE, ports, modules, sub-systems, external interfaces, people and document metadata) so the list and detail views need no extra requests.',
  })
  @ApiOkResponse({ type: SystemListResponseDto })
  findAll(@Query() query: QuerySystemsDto) {
    return this.systemsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one system, fully expanded' })
  @ApiOkResponse({ type: ExpandedSystemDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.systemsService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a system with all of its child collections',
    description:
      'The whole nested payload is created in a single transaction. Documents are uploaded separately via POST /api/systems/:id/documents.',
  })
  @ApiOkResponse({ type: ExpandedSystemDto })
  create(@Body() data: CreateSystemRequestDto, @CurrentUser() user: SessionUser) {
    return this.systemsService.create(data, user);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a system',
    description:
      'Scalar fields are patched. A child collection present in the body replaces the existing rows completely; an absent collection is left untouched; an empty array clears it. All in one transaction.',
  })
  @ApiOkResponse({ type: ExpandedSystemDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateSystemRequestDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.systemsService.update(id, data, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a system',
    description:
      'Soft delete: the system is flagged as deleted rather than removed, so it can be restored from its audit trail entry. To every normal read (list, detail, map, MCP) it behaves exactly like a hard delete.',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: SessionUser): Promise<void> {
    await this.systemsService.remove(id, user);
    this.logger.log(`Soft-deleted system ${id}`);
  }

  @Post(':id/restore')
  @ApiOperation({
    summary: 'Restore a soft-deleted system',
    description: 'Reachable from the DELETE entry in the audit trail. Clears the deleted flag.',
  })
  @ApiOkResponse({ type: ExpandedSystemDto })
  restore(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: SessionUser) {
    return this.systemsService.restore(id, user);
  }
}
