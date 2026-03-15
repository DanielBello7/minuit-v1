import { PageQueryParamsDto } from '@app/util/dto';
import { BaseOmit, IAlarm } from '@repo/types';
import { IsBoolean, IsOptional, IsString, IsTimeZone, IsUUID } from 'class-validator';

export class QueryAlarmsByPage
  extends PageQueryParamsDto
  implements Omit<BaseOmit<IAlarm>, 'ring_at'>
{
  @IsOptional()
  @IsUUID()
  user_id: string;
  @IsOptional()
  @IsBoolean()
  is_active: boolean;
  @IsOptional()
  @IsString()
  city: string;
  @IsOptional()
  @IsString()
  country: string;
  @IsOptional()
  @IsString()
  region: string;
  @IsOptional()
  @IsTimeZone()
  timezone: string;
}
