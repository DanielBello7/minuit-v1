import { CommonBase } from '@app/util';
import { CLOCK_FORMAT, IClock } from '@repo/types';
import { Column, Entity, Unique } from 'typeorm';

// prettier-ignore
@Entity("clocks")
@Unique(["user_id", "city"])
export class ClockSchema extends CommonBase implements IClock {
  @Column({ type: 'uuid' }) user_id: string;
  @Column({ type: 'varchar' }) city: string;
  @Column({ type: 'varchar' }) region: string;
  @Column({ type: 'varchar' }) country: string;
  @Column({ type: 'varchar' }) timezone: string;
  @Column({ type: 'enum', enum: CLOCK_FORMAT }) format: CLOCK_FORMAT;
  @Column({ type: 'boolean' }) is_active: boolean;
  @Column({ type: 'varchar', nullable: true }) title?: string | undefined;
  @Column({ type: 'varchar', nullable: true }) description?: string | undefined;
  @Column({ type: 'varchar', nullable: true }) theme?: string | undefined;
}
