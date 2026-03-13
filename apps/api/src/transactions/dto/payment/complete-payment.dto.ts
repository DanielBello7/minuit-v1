import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CompletePaymentDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;
  @IsNotEmpty()
  @IsString()
  method: string;
  @IsNotEmpty()
  @IsString()
  gateway: string;
  @IsNotEmpty()
  @IsString()
  ref_id: string;
}
