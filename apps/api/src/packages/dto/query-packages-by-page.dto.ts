import { PageQueryParamsDto } from '@app/util/dto';
import { BaseOmit, DURATION_PERIOD_ENUM, IPackage } from '@repo/types';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryPackagesByPageDto
  extends PageQueryParamsDto
  implements Omit<BaseOmit<IPackage>, 'pricings' | 'features'>
{
  @IsOptional()
  @IsString()
  title: string;
  @IsOptional()
  @IsString()
  description: string;
  @IsOptional()
  @IsNumber()
  duration: number;
  @IsOptional()
  @IsEnum(DURATION_PERIOD_ENUM)
  duration_period: DURATION_PERIOD_ENUM;
  @IsOptional()
  @IsString()
  admin_id: string;
  @IsOptional()
  @IsBoolean()
  all: boolean;
}
