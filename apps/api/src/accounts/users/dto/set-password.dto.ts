import { IsNotEmpty, IsUUID } from 'class-validator';

export class SetPasswordDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;
  @IsNotEmpty()
  new_password: string;
}
