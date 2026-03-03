import { IsEmail, IsNotEmpty } from 'class-validator';

export class SigninEmailDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
