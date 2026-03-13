import { IsCurrencyCode, IsMoneyString } from '@app/util';
import { type CurrencyCode } from '@repo/types';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CompleteRefundsDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;
  @IsNotEmpty()
  @IsMoneyString()
  amount_refunded: string;
  @IsNotEmpty()
  @IsCurrencyCode()
  currency_code: CurrencyCode;
}
