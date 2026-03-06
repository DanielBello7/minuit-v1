import {
  IsNotEmpty,
  IsDate,
  IsEmail,
  IsEnum,
  MaxLength,
  IsString,
  MinLength,
} from 'class-validator';
import { BaseOmit, IOTP, OTP_PURPOSE_ENUM } from '@repo/types';

export class CreateOtpDto implements BaseOmit<IOTP> {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(6)
  value: string;
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsEnum(OTP_PURPOSE_ENUM)
  purpose: OTP_PURPOSE_ENUM;
  @IsNotEmpty()
  @IsDate()
  expires_at: Date;
}
