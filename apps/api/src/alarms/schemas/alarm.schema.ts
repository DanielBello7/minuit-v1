import { UserSchema } from '@/accounts/users/schemas/user.schema';
import { CommonBase } from '@app/util';
import { IAlarm, RingAtType } from '@repo/types';
import { Column, Entity, JoinColumn, ManyToOne, type Relation } from 'typeorm';

// prettier-ignore
@Entity("alarms")
export class AlarmSchema extends CommonBase implements IAlarm {
  @Column({ type: 'uuid' }) user_id: string;
  @Column({ type: 'jsonb', default: [] }) ring_at: RingAtType[];
  @Column({ type: 'boolean' }) is_active: boolean;
  @Column({ type: 'varchar' }) city: string;
  @Column({ type: 'varchar' }) country: string;
  @Column({ type: 'varchar' }) region: string;
  @Column({ type: 'varchar' }) timezone: string;

  @ManyToOne(() => UserSchema)
  @JoinColumn({ name: "user_id" })
  User: Relation<UserSchema>
}
