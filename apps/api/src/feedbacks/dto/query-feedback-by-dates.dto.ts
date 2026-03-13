import { DateQueryParamsDto } from '@app/util/dto';
import { BaseOmit, IFeedback } from '@repo/types';
import { IsNumber, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryFeedbackByDatesDto extends DateQueryParamsDto implements BaseOmit<IFeedback> {
  @IsOptional()
  @IsUUID()
  user_id: string;
  @IsOptional()
  @IsString()
  name: string;
  @IsOptional()
  @IsString()
  message: string;
  @IsOptional()
  @IsNumber()
  rating: number;
}
