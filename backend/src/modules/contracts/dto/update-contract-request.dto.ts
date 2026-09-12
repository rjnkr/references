import { PartialType } from '@nestjs/swagger';
import { CreateContractRequestDto } from './create-contract-request.dto';

/**
 * PATCH /api/contracts/:id - every field is optional.
 *
 * Semantics for `completionDates`: present in the body it replaces the existing rows
 * entirely (delete + recreate inside one transaction); absent it is left untouched;
 * an empty array clears it.
 */
export class UpdateContractRequestDto extends PartialType(CreateContractRequestDto) {}
