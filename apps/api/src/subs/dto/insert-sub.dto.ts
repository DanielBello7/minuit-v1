import { PickType } from '@nestjs/mapped-types';
import { CreateSubDto } from './create-sub.dto';
import { type CurrencyCode } from '@repo/types';
import { IsNotEmpty } from 'class-validator';
import { IsCurrencyCode } from '@app/util';

export class InsertSubDto extends PickType(CreateSubDto, [
  'user_id',
  'package_id',
]) {
  @IsNotEmpty()
  @IsCurrencyCode()
  currency_code: CurrencyCode;
}
