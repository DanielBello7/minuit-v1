import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class VerifyUserEmailDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  otp: string;
}
