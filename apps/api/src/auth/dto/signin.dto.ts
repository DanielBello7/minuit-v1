import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SigninDto {
  @IsNotEmpty()
  @IsEmail()
  username: string;
  @IsNotEmpty()
  @IsString()
  password: string;
}
