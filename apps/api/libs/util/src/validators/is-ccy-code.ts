import { applyDecorators } from '@nestjs/common';
import { IsString, Matches } from 'class-validator';

type IsCurrencyCodeParams = {
  each: boolean;
};

export function IsCurrencyCode(params: Partial<IsCurrencyCodeParams> = { each: false }) {
  const each = params.each;
  return applyDecorators(
    IsString({ each }),
    Matches(/^[A-Z]{3}$/, {
      message: 'currency_code must be a valid ISO 4217 currency code',
    }),
  );
}
