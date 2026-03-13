import { IsCurrencyCode } from '@app/util';
import { BaseOmit, type CurrencyCode, ICharge, ICurrency, ISettings } from '@repo/types';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

class ICurrencyDto implements ICurrency {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNotEmpty()
  @IsCurrencyCode()
  code: CurrencyCode;
  @IsNotEmpty()
  @IsString()
  symbol: string;
  @IsOptional()
  @IsString()
  numeric_code?: string | undefined;
}

class IChargeDto implements ICharge {
  @IsNotEmpty()
  @IsCurrencyCode()
  currency_code: CurrencyCode;
  @IsNotEmpty()
  @IsString()
  amount: string;
}

class ChargesDto {
  @IsNotEmpty()
  @IsNotEmptyObject()
  @Type(() => IChargeDto)
  @ValidateNested({ each: true })
  PAYMENT: ICharge[];
  @IsNotEmpty()
  @IsNotEmptyObject()
  @Type(() => IChargeDto)
  @ValidateNested({ each: true })
  REFUNDS: ICharge[];
}
export class CreateSettingDto implements BaseOmit<ISettings> {
  @IsNotEmpty()
  @IsString()
  version: string;
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  max_free_alarms: number;
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  max_free_clocks: number;
  @IsNotEmpty()
  @Type(() => ICurrencyDto)
  @ValidateNested({ each: true })
  currencies: ICurrencyDto[];
  @IsNotEmpty()
  @IsNotEmptyObject()
  @Type(() => ChargesDto)
  @ValidateNested()
  charges: { PAYMENT: ICharge[]; REFUNDS: ICharge[] };
  @IsNotEmpty()
  @IsNumber()
  transaction_expiry_hours: number;
}
