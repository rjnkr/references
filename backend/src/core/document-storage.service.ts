import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Owns everything that touches the filesystem. Files live under STORAGE_DIR,
 * namespaced per caller (e.g. "systems"/"contracts") and owning entity id, with a
 * generated name so two uploads of "contract.pdf" never collide:
 *
 *   <STORAGE_DIR>/<namespace>/<ownerId>/<uuid><original extension>
 *
 * Only the path relative to STORAGE_DIR is stored in the database, so the
 * storage root can be moved or remounted without touching data. Files uploaded
 * before the Contract/System split (or before this service was namespaced) keep
 * their original, un-namespaced `<id>/...` path - `filePath` is opaque and never
 * has to match the row's current id or follow the current layout.
 */
@Injectable()
export class DocumentStorageService {
  private readonly logger = new Logger(DocumentStorageService.name);
  private readonly root: string;

  constructor(private readonly configService: ConfigService) {
    this.root = path.resolve(this.configService.get<string>('STORAGE.DIR') ?? './storage/documents');
  }

  get storageRoot(): string {
    return this.root;
  }

  /** Absolute path for a relative path as stored in the database. */
  absolutePath(relativePath: string): string {
    // path.join + a normalise guard keeps a malformed database value from
    // escaping the storage root.
    const resolved = path.resolve(this.root, relativePath);
    if (!resolved.startsWith(this.root + path.sep) && resolved !== this.root) {
      throw new Error(`Refusing to resolve "${relativePath}" outside the storage root`);
    }
    return resolved;
  }

  /**
   * Writes an uploaded buffer to disk and returns the relative path to store.
   */
  async save(
    namespace: string,
    ownerId: number,
    originalName: string,
    buffer: Buffer,
  ): Promise<string> {
    const extension = path.extname(originalName).slice(0, 20);
    const relativePath = path.join(namespace, String(ownerId), `${randomUUID()}${extension}`);
    const absolute = this.absolutePath(relativePath);

    await fs.promises.mkdir(path.dirname(absolute), { recursive: true });
    await fs.promises.writeFile(absolute, buffer);

    return relativePath;
  }

  exists(relativePath: string): boolean {
    try {
      return fs.existsSync(this.absolutePath(relativePath));
    } catch {
      return false;
    }
  }

  createReadStream(relativePath: string): fs.ReadStream {
    return fs.createReadStream(this.absolutePath(relativePath));
  }

  /**
   * Best-effort removal. A file that cannot be deleted is logged and ignored -
   * the database row is the source of truth and a stray file only wastes disk.
   */
  async deleteQuietly(relativePath: string): Promise<void> {
    try {
      await fs.promises.unlink(this.absolutePath(relativePath));
    } catch (e) {
      if (e?.code !== 'ENOENT') {
        this.logger.warn(`Could not delete ${relativePath} from disk: ${e.message}`);
      }
    }
  }
}
