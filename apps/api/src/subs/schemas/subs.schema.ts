import { CONSTANTS } from '@app/constants';
import { CommonBase } from '@app/util';
import { CURRENCY_ENUM, DURATION_PERIOD_ENUM, ISubscription } from '@repo/types';
import { Column, Entity } from 'typeorm';

// prettier-ignore
@Entity("subscriptions")
export class SubscriptionSchema extends CommonBase implements ISubscription {
  @Column({ type: "uuid" }) transaction_id: string;
  @Column({ type: "uuid" }) user_id: string;
  @Column({ type: "uuid" }) package_id: string;
  @Column({ type: "enum", enum: CURRENCY_ENUM }) currency: CURRENCY_ENUM;
  @Column({ type: 'decimal', precision: 20, scale: CONSTANTS.AMOUNT_SCALE }) amount: string;
  @Column({ type: 'decimal', precision: 20, scale: CONSTANTS.AMOUNT_SCALE }) charge: string;
  @Column({ type: "int" }) duration: number;
  @Column({ type: "enum", enum: DURATION_PERIOD_ENUM }) duration_period: DURATION_PERIOD_ENUM;
  @Column({ type: "timestamp" }) expires_at: Date;
  @Column({ type: "timestamp", nullable: true }) last_used_at: Date | undefined;
  @Column({ type: "timestamp", nullable: true }) used_at: Date | undefined;
}
