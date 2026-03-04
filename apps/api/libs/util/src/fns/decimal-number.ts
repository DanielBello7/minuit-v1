import { CONSTANTS, MONEY_NUMBER_REGEX } from '@app/constants';
import { BadRequestException } from '@nestjs/common';
import Decimal from 'decimal.js';

export const decimal_number = (val: Decimal.Value) => {
  if (typeof val === 'string') {
    if (!MONEY_NUMBER_REGEX.test(val)) {
      throw new BadRequestException(`Invalid amount format: ${val}`);
    }
  }

  return new Decimal(val).toDecimalPlaces(CONSTANTS.AMOUNT_SCALE);
};
