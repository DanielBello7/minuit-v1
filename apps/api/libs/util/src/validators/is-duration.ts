import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsDuration(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsDurationHumanReadable',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          return /^(\d+\s*h)?\s*(\d+\s*m)?$/.test(value.trim());
        },
      },
    });
  };
}
