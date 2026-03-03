import { IOTP, OTP_PURPOSE_ENUM } from '@repo/types';

export class OtpEntity implements IOTP {
  id: string;
  index: number;
  ref_id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | undefined;
  value: string;
  email: string;
  purpose: OTP_PURPOSE_ENUM;
  expires_at: Date;
}
