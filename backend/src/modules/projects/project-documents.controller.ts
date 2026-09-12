import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { memoryStorage } from 'multer';
import { CurrentUser, SessionUser } from '../../core/decorators/current-user.decorator';
import { ExpandedProjectDocumentDto } from './dto/expanded-project.dto';
import { UploadProjectDocumentDto } from './dto/upload-document.dto';
import { ProjectDocumentsService } from './project-documents.service';

/**
 * Multer is configured with in-memory storage: DocumentStorageService decides
 * the final path, and validating the request before anything is written keeps
 * disk and database in step. Fine for the 25 MB default cap on an internal
 * tool; switch to diskStorage if MAX_UPLOAD_MB is raised a lot.
 */
const maxUploadBytes = () => parseInt(process.env.MAX_UPLOAD_MB ?? '25', 10) * 1024 * 1024;

@Controller('projects/:projectId/documents')
@ApiTags('Project documents')
export class ProjectDocumentsController {
  constructor(private readonly documentsService: ProjectDocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'List the documents of a project' })
  @ApiOkResponse({ type: ExpandedProjectDocumentDto, isArray: true })
  list(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.documentsService.list(projectId);
  }

  @Post()
  @ApiOperation({
    summary: 'Upload a document for a project',
    description:
      'multipart/form-data with the file in the `file` field and the DocumentType id in `documentType`. The file is stored under STORAGE_DIR/projects/<projectId>/ with a generated name; only the relative path is kept in the database.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'documentType'],
      properties: {
        file: { type: 'string', format: 'binary' },
        documentType: { type: 'integer', description: 'DocumentType.id' },
      },
    },
  })
  @ApiOkResponse({ type: ExpandedProjectDocumentDto })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: maxUploadBytes(), files: 1 },
    }),
  )
  upload(
    @Param('projectId', ParseIntPipe) projectId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadProjectDocumentDto,
    @CurrentUser() user: SessionUser,
  ) {
    const documentTypeId = body.documentType ?? body.documentTypeId;
    if (documentTypeId === undefined) {
      throw new BadRequestException('documentType (a DocumentType id) is required');
    }

    return this.documentsService.upload(projectId, documentTypeId, file, user?.email);
  }

  @Get(':documentId')
  @ApiOperation({
    summary: 'Download a document',
    description: 'Streams the file with Content-Disposition set to the original filename.',
  })
  async download(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('documentId', ParseIntPipe) documentId: number,
    @Res() res: Response,
  ): Promise<void> {
    const { document, stream } = await this.documentsService.openForDownload(projectId, documentId);

    res.set({
      'Content-Type': document.mimeType,
      'Content-Length': String(document.fileSize),
      // RFC 5987 filename* so non-ASCII filenames survive.
      'Content-Disposition': `attachment; filename="${document.fileName.replace(/["\\]/g, '_')}"; filename*=UTF-8''${encodeURIComponent(document.fileName)}`,
    });

    stream.pipe(res);
  }

  @Delete(':documentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a document',
    description: 'Removes the database row and deletes the file from disk (best effort).',
  })
  async remove(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('documentId', ParseIntPipe) documentId: number,
  ): Promise<void> {
    await this.documentsService.remove(projectId, documentId);
  }
}
