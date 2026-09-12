import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { ProjectDocumentsController } from './project-documents.controller';
import { ProjectDocumentsService } from './project-documents.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [CoreModule],
  controllers: [ProjectsController, ProjectDocumentsController],
  providers: [ProjectsService, ProjectDocumentsService],
  exports: [ProjectsService, ProjectDocumentsService],
})
export class ProjectsModule {}
