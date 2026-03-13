import { IsCurrencyCode, IsMoneyString } from '@app/util';
import { IndexQueryParamsDto } from '@app/util/dto';
import {
  BaseOmit,
  type CurrencyCode,
  ITransactionsBase,
  TRANSACTION_STATUS_ENUM,
  TRANSACTION_TYPE_ENUM,
} from '@repo/types';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryTransactionByIndexDto
  extends IndexQueryParamsDto
  implements Omit<BaseOmit<ITransactionsBase>, 'narration' | 'metadata'>
{
  @IsOptional()
  @IsUUID()
  user_id: string;
  @IsOptional()
  @IsMoneyString()
  charge: string;
  @IsOptional()
  @IsMoneyString()
  amount: string;
  @IsOptional()
  @IsCurrencyCode()
  currency_code: CurrencyCode;
  @IsOptional()
  @IsString()
  gateway: string;
  @IsOptional()
  @IsString()
  method: string;
  @IsOptional()
  @IsEnum(TRANSACTION_TYPE_ENUM)
  type: TRANSACTION_TYPE_ENUM;
  @IsOptional()
  @IsEnum(TRANSACTION_STATUS_ENUM)
  status: TRANSACTION_STATUS_ENUM;
}
