import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'maxWords', async: false })
export class MaxWordsConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    if (typeof value !== 'string') {
      // Let @IsString() report the type problem; nothing to count here.
      return true;
    }
    return countWords(value) <= (args.constraints[0] as number);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} may not exceed ${args.constraints[0]} words`;
  }
}

export function countWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Caps a free-text field at a number of whitespace-separated words. Used for
 * System.scope, which is TEXT in the database but limited to 200 words by the
 * business rules - so the limit lives at the API layer, not in the schema.
 */
export function MaxWords(max: number, validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'maxWords',
      target: object.constructor,
      propertyName,
      constraints: [max],
      options: validationOptions,
      validator: MaxWordsConstraint,
    });
  };
}
