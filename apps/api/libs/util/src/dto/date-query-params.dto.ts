import { SORT_TYPE_ENUM } from '@repo/types';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsDate,
  IsNumber,
  IsEnum,
  ValidateNested,
} from 'class-validator';

class DateQueryDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date?: Date;
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pick: number;
  @IsOptional()
  @IsEnum(SORT_TYPE_ENUM)
  sort: SORT_TYPE_ENUM;
}
export class DateQueryParamsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => DateQueryDto)
  pagination?: DateQueryDto;
}
