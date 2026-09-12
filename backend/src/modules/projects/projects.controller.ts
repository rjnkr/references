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
import { CreateProjectRequestDto } from './dto/create-project-request.dto';
import { ExpandedProjectDto, ProjectListResponseDto } from './dto/expanded-project.dto';
import { QueryProjectsDto } from './dto/query-projects.dto';
import { UpdateProjectRequestDto } from './dto/update-project-request.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
@ApiTags('Projects')
export class ProjectsController {
  private readonly logger = new Logger(ProjectsController.name);

  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({
    summary: 'List projects',
    description:
      'Filtered, sorted and paginated list. Every item is fully expanded (currency, linked System summary, completion dates, document metadata) so the list and detail views need no extra requests.',
  })
  @ApiOkResponse({ type: ProjectListResponseDto })
  findAll(@Query() query: QueryProjectsDto) {
    return this.projectsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one project, fully expanded' })
  @ApiOkResponse({ type: ExpandedProjectDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a project with all of its child collections',
    description: 'The whole nested payload is created in a single transaction.',
  })
  @ApiOkResponse({ type: ExpandedProjectDto })
  create(@Body() data: CreateProjectRequestDto, @CurrentUser() user: SessionUser) {
    return this.projectsService.create(data, user);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a project',
    description:
      'Scalar fields are patched. A child collection present in the body replaces the existing rows completely; an absent collection is left untouched; an empty array clears it. All in one transaction.',
  })
  @ApiOkResponse({ type: ExpandedProjectDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateProjectRequestDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.projectsService.update(id, data, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a project',
    description:
      'Soft delete: the project is flagged as deleted rather than removed, so it can be restored from its audit trail entry. To every normal read (list, detail, MCP) it behaves exactly like a hard delete.',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: SessionUser): Promise<void> {
    await this.projectsService.remove(id, user);
    this.logger.log(`Soft-deleted project ${id}`);
  }

  @Post(':id/restore')
  @ApiOperation({
    summary: 'Restore a soft-deleted project',
    description: 'Reachable from the DELETE entry in the audit trail. Clears the deleted flag.',
  })
  @ApiOkResponse({ type: ExpandedProjectDto })
  restore(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: SessionUser) {
    return this.projectsService.restore(id, user);
  }
}
