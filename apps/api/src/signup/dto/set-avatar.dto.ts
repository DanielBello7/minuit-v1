import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SetAvatarDto {
  @IsNotEmpty()
  @IsString()
  value: string;
  @IsNotEmpty()
  @IsUUID()
  user_id: string;
}
