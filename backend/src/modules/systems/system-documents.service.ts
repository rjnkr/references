import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SystemDocument } from '@prisma/client';
import { DbService } from '../../database/db-service/db.service';
import { DocumentStorageService } from '../../core/document-storage.service';

@Injectable()
export class SystemDocumentsService {
  constructor(
    private readonly db: DbService,
    private readonly storage: DocumentStorageService,
  ) {}

  list(systemId: number) {
    return this.db.systemDocument.findMany({
      where: { systemId },
      include: { documentType: true },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  /**
   * Stores an uploaded file on disk and records its metadata.
   * Validation happens before the write so a rejected upload leaves nothing
   * behind on disk.
   */
  async upload(
    systemId: number,
    documentTypeId: number,
    file: { originalname: string; buffer: Buffer; size: number; mimetype: string },
    uploadedBy?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file was uploaded (expected multipart field "file")');
    }

    // Both foreign keys are checked up front so a bad request never results in
    // an orphaned file. A soft-deleted system 404s here the same as a missing one.
    await this.db.system.findFirstOrThrow({
      where: { id: systemId, deleted: false },
      select: { id: true },
    });
    await this.db.documentType.findUniqueOrThrow({
      where: { id: documentTypeId },
      select: { id: true },
    });

    const relativePath = await this.storage.save('systems', systemId, file.originalname, file.buffer);

    try {
      return await this.db.systemDocument.create({
        data: {
          systemId,
          documentTypeId,
          fileName: file.originalname.slice(0, 255),
          filePath: relativePath,
          fileSize: file.size,
          mimeType: (file.mimetype || 'application/octet-stream').slice(0, 150),
          uploadedBy: uploadedBy ?? null,
        },
        include: { documentType: true },
      });
    } catch (e) {
      // Roll the filesystem back so it stays consistent with the database.
      await this.storage.deleteQuietly(relativePath);
      throw e;
    }
  }

  /** Looks up the metadata row, scoped to the system in the URL. */
  async findOne(systemId: number, documentId: number) {
    const document = await this.db.systemDocument.findFirst({
      where: { id: documentId, systemId },
      include: { documentType: true },
    });

    if (!document) {
      throw new NotFoundException(`Document ${documentId} does not exist for system ${systemId}`);
    }
    return document;
  }

  /** Metadata plus a read stream, for the download endpoint. */
  async openForDownload(systemId: number, documentId: number) {
    const document = await this.findOne(systemId, documentId);

    if (!this.storage.exists(document.filePath)) {
      throw new NotFoundException(
        `The file for document ${documentId} is missing from storage (${document.filePath})`,
      );
    }

    return { document, stream: this.storage.createReadStream(document.filePath) };
  }

  /** Deletes the metadata row, then the file from disk (best effort). */
  async remove(systemId: number, documentId: number): Promise<SystemDocument> {
    const document = await this.findOne(systemId, documentId);
    const deleted = await this.db.systemDocument.delete({ where: { id: document.id } });
    await this.storage.deleteQuietly(document.filePath);
    return deleted;
  }
}
