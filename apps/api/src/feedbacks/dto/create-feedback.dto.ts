import { BaseOmit, IFeedback } from '@repo/types';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateFeedbackDto implements BaseOmit<IFeedback> {
  @IsOptional()
  @IsUUID()
  user_id?: string | undefined;
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsString()
  @IsNotEmpty()
  message: string;
  @IsNotEmpty()
  @IsNumber()
  rating: number;
}
