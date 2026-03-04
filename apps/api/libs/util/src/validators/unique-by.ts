import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function UniqueBy<T>(
  property: keyof T,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'UniqueBy',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: T[], _args: ValidationArguments) {
          if (!Array.isArray(value)) return false;

          const seen = new Set();
          for (const item of value) {
            const key = item?.[property];
            if (seen.has(key)) return false;
            seen.add(key);
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must not contain duplicate ${String(
            property,
          )} values`;
        },
      },
    });
  };
}
