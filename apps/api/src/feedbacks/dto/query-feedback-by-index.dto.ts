import { IndexQueryParamsDto } from '@app/util/dto';
import { BaseOmit, IFeedback } from '@repo/types';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryFeedbackByIndexDto extends IndexQueryParamsDto implements BaseOmit<IFeedback> {
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
  @IsString()
  rating: number;
}
