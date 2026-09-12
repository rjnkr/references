import { PartialType } from '@nestjs/swagger';
import { CreateProjectRequestDto } from './create-project-request.dto';

/**
 * PATCH /api/projects/:id - every field is optional.
 *
 * Semantics for `completionDates`: present in the body it replaces the existing rows
 * entirely (delete + recreate inside one transaction); absent it is left untouched;
 * an empty array clears it.
 */
export class UpdateProjectRequestDto extends PartialType(CreateProjectRequestDto) {}
