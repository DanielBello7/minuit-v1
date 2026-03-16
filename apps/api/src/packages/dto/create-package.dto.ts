import { IsCurrencyCode, IsMoneyString } from '@app/util';
import {
  BaseOmit,
  type CurrencyCode,
  DURATION_PERIOD_ENUM,
  IPackage,
  PRICING_TYPE_ENUM,
  PricingType,
} from '@repo/types';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreatePricingTypeDto implements PricingType {
  @IsNotEmpty()
  @IsString()
  @IsCurrencyCode()
  currency_code: CurrencyCode;
  @IsNotEmpty()
  @IsMoneyString()
  amount: string;
}

export class CreatePackagesDto implements BaseOmit<IPackage> {
  @IsNotEmpty()
  @IsEnum(PRICING_TYPE_ENUM)
  type: PRICING_TYPE_ENUM;
  @IsNotEmpty()
  @Type(() => CreatePricingTypeDto)
  @ValidateNested({ each: true })
  pricings: PricingType[];
  @IsNotEmpty()
  @IsString()
  title: string;
  @IsNotEmpty()
  @IsString()
  description: string;
  @IsNotEmpty()
  @IsString({ each: true })
  features: string[];
  @IsNotEmpty()
  @IsNumber()
  duration: number;
  @IsNotEmpty()
  @IsEnum(DURATION_PERIOD_ENUM)
  duration_period: DURATION_PERIOD_ENUM;
  @IsNotEmpty()
  @IsUUID()
  admin_id: string;
}
