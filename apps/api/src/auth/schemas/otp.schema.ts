import { CommonBase } from '@app/util';
import { OtpEntity } from '../entities/otp.entity';
import { OTP_PURPOSE_ENUM } from '@repo/types';
import { Column, Entity } from 'typeorm';

@Entity('otps')
export class OtpSchema extends CommonBase implements OtpEntity {
  @Column({ type: 'varchar', length: 6, unique: true }) value: string;
  @Column({ type: 'varchar' }) email: string;
  @Column({ type: 'enum', enum: OTP_PURPOSE_ENUM }) purpose: OTP_PURPOSE_ENUM;
  @Column({ type: 'timestamp' }) expires_at: Date;
}
