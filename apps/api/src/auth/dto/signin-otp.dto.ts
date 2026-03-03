import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SigninOtpDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  otp: string;
}
