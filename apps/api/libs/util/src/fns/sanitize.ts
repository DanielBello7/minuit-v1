import { BadRequestException } from '@nestjs/common';
import { isValidDto } from '../validators';

export function sanitize<T>(body: object, dtoClass: new () => T extends object ? T : never) {
  const errors = isValidDto(body, dtoClass);
  if (errors.length > 0) throw new BadRequestException(errors);
  return body as T;
}
