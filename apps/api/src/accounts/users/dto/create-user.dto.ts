import { AccountType, BaseOmit, IUser } from '@repo/types';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsJWT,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsTimeZone,
  IsUrl,
} from 'class-validator';

export class CreateUserDto implements BaseOmit<IUser> {
  @IsNotEmpty()
  @IsString()
  firstname: string;
  @IsNotEmpty()
  @IsString()
  surname: string;
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsOptional()
  @IsString()
  password: string | undefined;
  @IsOptional()
  @IsUrl({ require_tld: false })
  avatar: string | undefined;
  @IsNotEmpty()
  @IsTimeZone()
  timezone: string;
  @IsNotEmpty()
  @IsString()
  username: string;
  @IsNotEmpty()
  @IsString()
  display_name: string;
  @IsNotEmpty()
  @IsEnum(AccountType)
  type: AccountType;
  @IsNotEmpty()
  @IsBoolean()
  is_email_verified: boolean;
  @IsNotEmpty()
  @IsBoolean()
  has_password: boolean;
  @IsOptional()
  @IsJWT()
  refresh_token: string | undefined;
  @IsOptional()
  @IsDate()
  last_login_date: Date | undefined;
  @IsNotEmpty()
  @IsBoolean()
  dark_mode: boolean;
  @IsNotEmpty()
  @IsBoolean()
  is_onboarded: boolean;
}
