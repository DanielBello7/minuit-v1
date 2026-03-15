import { PageQueryParamsDto } from '@app/util/dto';
import { BaseOmit, CLOCK_FORMAT, IClock } from '@repo/types';
import { IsBoolean, IsEnum, IsOptional, IsString, IsTimeZone, IsUUID } from 'class-validator';

export class QueryClocksByPage
  extends PageQueryParamsDto
  implements Omit<BaseOmit<IClock>, 'description'>
{
  @IsOptional()
  @IsUUID()
  user_id: string;
  @IsOptional()
  @IsString()
  city: string;
  @IsOptional()
  @IsString()
  region: string;
  @IsOptional()
  @IsString()
  country: string;
  @IsOptional()
  @IsTimeZone()
  timezone: string;
  @IsOptional()
  @IsEnum(CLOCK_FORMAT)
  format: CLOCK_FORMAT;
  @IsOptional()
  @IsBoolean()
  is_active: boolean;
  @IsOptional()
  @IsString()
  title?: string | undefined;
  @IsOptional()
  @IsString()
  theme?: string | undefined;
}
