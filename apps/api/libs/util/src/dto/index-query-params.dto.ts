import { SORT_TYPE_ENUM } from '@repo/types';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, ValidateNested } from 'class-validator';

class IndexQueryDto {
  /** Cursor: return items after this index (for cursor-based pagination). */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  index?: number;

  /** Page size (number of items per page). */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pick?: number;

  /** Sort order by index (ASC | DESC). */
  @IsOptional()
  @IsEnum(SORT_TYPE_ENUM)
  sort?: SORT_TYPE_ENUM;
}

export class IndexQueryParamsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => IndexQueryDto)
  pagination?: IndexQueryDto;
}
