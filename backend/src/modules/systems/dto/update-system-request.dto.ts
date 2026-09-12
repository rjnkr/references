import { PartialType } from '@nestjs/swagger';
import { CreateSystemRequestDto } from './create-system-request.dto';

/**
 * PATCH /api/systems/:id - every field is optional.
 *
 * Semantics for the child collections: a collection that is *present* in the
 * body replaces the existing rows entirely (delete + recreate inside one
 * transaction). A collection that is absent is left untouched. Send an empty
 * array to clear a collection.
 *
 * Documents are never touched here - they are managed through
 * /api/systems/:id/documents.
 */
export class UpdateSystemRequestDto extends PartialType(CreateSystemRequestDto) {}
