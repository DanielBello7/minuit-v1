import { SORT_TYPE_ENUM } from '@repo/types';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';

class PageQueryDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pick: number;
  @IsOptional()
  @IsEnum(SORT_TYPE_ENUM)
  sort?: SORT_TYPE_ENUM;
}

export class PageQueryParamsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => PageQueryDto)
  pagination?: PageQueryDto;
}
