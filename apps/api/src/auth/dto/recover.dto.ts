import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class RecoverDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsString()
  @Length(6, 6, { message: 'otp must be exactly 6 characters' })
  otp: string;
  @IsNotEmpty()
  @IsString()
  password: string;
}
