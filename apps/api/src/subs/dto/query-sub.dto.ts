import { IsCurrencyCode, IsMoneyString } from '@app/util';
import { IndexQueryParamsDto } from '@app/util/dto';
import {
  BaseOmit,
  type CurrencyCode,
  DURATION_PERIOD_ENUM,
  ISubscription,
} from '@repo/types';
import {
  IsCurrency,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class QuerySubsByIndex
  extends IndexQueryParamsDto
  implements BaseOmit<ISubscription>
{
  @IsOptional()
  @IsUUID()
  transaction_id: string;
  @IsOptional()
  @IsUUID()
  user_id: string;
  @IsOptional()
  @IsUUID()
  package_id: string;
  @IsOptional()
  @IsCurrencyCode()
  @IsCurrency()
  currency_code: CurrencyCode;
  @IsOptional()
  @IsMoneyString()
  amount: string;
  @IsOptional()
  @IsMoneyString()
  charge: string;
  @IsOptional()
  @IsNumber()
  duration: number;
  @IsOptional()
  @IsEnum(DURATION_PERIOD_ENUM)
  duration_period: DURATION_PERIOD_ENUM;
  @IsOptional()
  @IsDate()
  expires_at: Date;
  @IsOptional()
  @IsDate()
  last_used_at: Date | undefined;
  @IsOptional()
  @IsDate()
  used_at: Date | undefined;
}
