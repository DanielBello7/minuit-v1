import { CommonBase } from '@app/util';
import { DURATION_PERIOD_ENUM, IPackage, PricingType } from '@repo/types';
import { Column, Entity } from 'typeorm';

// prettier-ignore
@Entity("packages")
export class PackageSchema extends CommonBase implements IPackage {
  @Column({ type: 'jsonb', default: [] }) pricings: PricingType[];
  @Column({ type: 'varchar' }) title: string;
  @Column({ type: 'varchar' }) description: string;
  @Column({ type: 'jsonb', default: [] }) features: string[];
  @Column({ type: 'int' }) duration: number;
  @Column({ type: "uuid" }) admin_id: string;
  @Column({ type: 'enum', enum: DURATION_PERIOD_ENUM }) duration_period: DURATION_PERIOD_ENUM;
}
