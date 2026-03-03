import { OtpEntity } from '@/auth/entities/otp.entity';
import { BaseOmit, OTP_PURPOSE_ENUM } from '@repo/types';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateOtpDto implements BaseOmit<OtpEntity> {
  @IsNotEmpty()
  @IsNumber()
  index: number;
  @IsNotEmpty()
  @IsUUID()
  ref_id: string;
  @IsNotEmpty()
  @IsString()
  @MaxLength(6)
  @MinLength(6)
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
