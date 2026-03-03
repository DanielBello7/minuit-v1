import { OmitType } from '@nestjs/mapped-types';
import { CreateOtpDto } from './create-otp.dto';

export class InsertOtp extends OmitType(CreateOtpDto, [
  'expires_at',
  'index',
  'ref_id',
  'value',
]) {}
