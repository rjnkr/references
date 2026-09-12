import { Transform } from 'class-transformer';

/**
 * HTML forms send an untouched optional input as an empty string, but
 * class-validator's @IsOptional() only skips null/undefined - so `""` would
 * fail @IsEmail()/@IsUrl() and the frontend would get a confusing 400.
 *
 * Put this above the validators on optional, format-constrained string fields
 * so a blank input is treated as "not supplied".
 */
export const EmptyToUndefined = () =>
  Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value));
