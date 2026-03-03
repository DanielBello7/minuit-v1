import { IsEmail, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class RecoverDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsString()
  @Min(6)
  @Max(6)
  otp: string;
  @IsNotEmpty()
  @IsString()
  password: string;
}
