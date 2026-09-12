import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

/**
 * The nested contract/system payload accepts two shapes for the simplest child
 * collections, so a client can send whichever is convenient:
 *
 *   ports:      [1, 2, 3]                 or  [{ unlocodeId: 1 }, ...]
 *   subSystems: ["VHF", "CCTV"]           or  [{ name: "VHF" }, ...]
 *
 * These decorators validate either form; ContractsService/SystemsService
 * normalise them to the Prisma shape. Keeping validation here (rather than
 * @ValidateNested) is what makes the union possible under
 * `forbidNonWhitelisted`.
 */

export function IsUnlocodeRefArray(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isUnlocodeRefArray',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (!Array.isArray(value)) {
            return false;
          }
          return value.every((item) => {
            if (Number.isInteger(item)) {
              return (item as number) > 0;
            }
            if (item && typeof item === 'object') {
              const id = (item as Record<string, unknown>).unlocodeId;
              return Number.isInteger(id) && (id as number) > 0;
            }
            return false;
          });
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} must be an array of UnLocode ids or of { unlocodeId } objects`;
        },
      },
    });
  };
}

export function IsTagRefArray(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isTagRefArray',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (!Array.isArray(value)) {
            return false;
          }
          return value.every((item) => {
            if (Number.isInteger(item)) {
              return (item as number) > 0;
            }
            if (item && typeof item === 'object') {
              const id = (item as Record<string, unknown>).tagId;
              return Number.isInteger(id) && (id as number) > 0;
            }
            return false;
          });
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} must be an array of Tag ids or of { tagId } objects`;
        },
      },
    });
  };
}

/** @param minLength Minimum number of entries required, e.g. `1` for "at least one". */
export function IsModuleRefArray(minLength = 0, validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isModuleRefArray',
      target: object.constructor,
      propertyName,
      constraints: [minLength],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          if (!Array.isArray(value)) {
            return false;
          }
          const min = args.constraints[0] as number;
          if (value.length < min) {
            return false;
          }
          return value.every((item) => {
            if (Number.isInteger(item)) {
              return (item as number) > 0;
            }
            if (item && typeof item === 'object') {
              const id = (item as Record<string, unknown>).moduleId;
              return Number.isInteger(id) && (id as number) > 0;
            }
            return false;
          });
        },
        defaultMessage(args: ValidationArguments): string {
          const min = args.constraints[0] as number;
          return min > 0
            ? `${args.property} must be an array of at least ${min} Module id(s) or { moduleId } object(s)`
            : `${args.property} must be an array of Module ids or of { moduleId } objects`;
        },
      },
    });
  };
}

export function IsNamedRefArray(maxLength = 150, validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isNamedRefArray',
      target: object.constructor,
      propertyName,
      constraints: [maxLength],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          if (!Array.isArray(value)) {
            return false;
          }
          const max = args.constraints[0] as number;
          return value.every((item) => {
            const name =
              typeof item === 'string'
                ? item
                : item && typeof item === 'object'
                  ? (item as Record<string, unknown>).name
                  : undefined;
            return typeof name === 'string' && name.trim().length > 0 && name.length <= max;
          });
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} must be an array of non-empty names (strings or { name } objects), each at most ${args.constraints[0]} characters`;
        },
      },
    });
  };
}

/** Pulls the UnLocode id out of either accepted form. */
export function toUnlocodeId(item: number | { unlocodeId: number }): number {
  return typeof item === 'number' ? item : item.unlocodeId;
}

/** Pulls the name out of either accepted form. */
export function toName(item: string | { name: string }): string {
  return (typeof item === 'string' ? item : item.name).trim();
}

/** Pulls the Tag id out of either accepted form. */
export function toTagId(item: number | { tagId: number }): number {
  return typeof item === 'number' ? item : item.tagId;
}

/** Pulls the Module id out of either accepted form. */
export function toModuleId(item: number | { moduleId: number }): number {
  return typeof item === 'number' ? item : item.moduleId;
}
