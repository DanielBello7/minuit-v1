import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePasswordDto {
  @IsNotEmpty()
  @IsString()
  old_password: string;
  @IsNotEmpty()
  @IsString()
  new_password: string;
}
