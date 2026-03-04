import { plainToInstance } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';

export function isValidDto<T>(
  input: object,
  dtoClass: new () => T extends object ? T : never,
): ValidationError[] {
  const dtoInstance = plainToInstance(dtoClass, input);
  const errors = validateSync(dtoInstance, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  return errors;
}
