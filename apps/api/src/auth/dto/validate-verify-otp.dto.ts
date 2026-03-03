import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ValidateVerifyOtpDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsString()
  otp: string;
}
