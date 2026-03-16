import { BaseOmit, IActiveSubs } from '@repo/types';
import { IsDate, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateHubDto implements BaseOmit<IActiveSubs> {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;
  @IsNotEmpty()
  @IsUUID()
  subscription_id: string;
  @IsNotEmpty()
  @IsDate()
  active_at: Date;
}
