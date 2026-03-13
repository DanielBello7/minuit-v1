import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendVerifyOtpDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
