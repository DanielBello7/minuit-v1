import { IsEmail, IsJWT, IsNotEmpty } from 'class-validator';

export class RefreshDto {
  @IsNotEmpty()
  @IsJWT()
  refresh: string;
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
