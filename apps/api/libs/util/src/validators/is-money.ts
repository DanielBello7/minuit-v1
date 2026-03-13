import { CONSTANTS, MONEY_NUMBER_REGEX } from '@app/constants';
import { applyDecorators } from '@nestjs/common';
import { IsString, Matches } from 'class-validator';

type IsMoneyStringParams = {
  each: boolean;
};

export function IsMoneyString(params: Partial<IsMoneyStringParams> = { each: false }) {
  const each = params.each ?? false;
  return applyDecorators(
    IsString({ each }),
    Matches(MONEY_NUMBER_REGEX, {
      each: params.each,
      message: `amount must be a valid number with up to ${CONSTANTS.AMOUNT_SCALE} decimal places, like 0.50, 1, or 10.99`,
    }),
  );
}
