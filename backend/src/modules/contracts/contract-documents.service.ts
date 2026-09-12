import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ContractDocument } from '@prisma/client';
import { DbService } from '../../database/db-service/db.service';
import { DocumentStorageService } from '../../core/document-storage.service';

@Injectable()
export class ContractDocumentsService {
  constructor(
    private readonly db: DbService,
    private readonly storage: DocumentStorageService,
  ) {}

  list(contractId: number) {
    return this.db.contractDocument.findMany({
      where: { contractId },
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
    contractId: number,
    documentTypeId: number,
    file: { originalname: string; buffer: Buffer; size: number; mimetype: string },
    uploadedBy?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file was uploaded (expected multipart field "file")');
    }

    // Both foreign keys are checked up front so a bad request never results in
    // an orphaned file. A soft-deleted contract 404s here the same as a missing one.
    await this.db.contract.findFirstOrThrow({
      where: { id: contractId, deleted: false },
      select: { id: true },
    });
    await this.db.documentType.findUniqueOrThrow({
      where: { id: documentTypeId },
      select: { id: true },
    });

    const relativePath = await this.storage.save('contracts', contractId, file.originalname, file.buffer);

    try {
      return await this.db.contractDocument.create({
        data: {
          contractId,
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

  /** Looks up the metadata row, scoped to the contract in the URL. */
  async findOne(contractId: number, documentId: number) {
    const document = await this.db.contractDocument.findFirst({
      where: { id: documentId, contractId },
      include: { documentType: true },
    });

    if (!document) {
      throw new NotFoundException(`Document ${documentId} does not exist for contract ${contractId}`);
    }
    return document;
  }

  /** Metadata plus a read stream, for the download endpoint. */
  async openForDownload(contractId: number, documentId: number) {
    const document = await this.findOne(contractId, documentId);

    if (!this.storage.exists(document.filePath)) {
      throw new NotFoundException(
        `The file for document ${documentId} is missing from storage (${document.filePath})`,
      );
    }

    return { document, stream: this.storage.createReadStream(document.filePath) };
  }

  /** Deletes the metadata row, then the file from disk (best effort). */
  async remove(contractId: number, documentId: number): Promise<ContractDocument> {
    const document = await this.findOne(contractId, documentId);
    const deleted = await this.db.contractDocument.delete({ where: { id: document.id } });
    await this.storage.deleteQuietly(document.filePath);
    return deleted;
  }
}
