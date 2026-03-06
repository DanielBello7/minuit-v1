import { CommonBase } from '@app/util';
import { IActiveSubs } from '@repo/types';
import { Column, Entity, JoinColumn, OneToOne, type Relation } from 'typeorm';
import { SubscriptionSchema } from './subs.schema';
import { UserSchema } from '@/accounts/users/schemas/user.schema';

// active subscriptions
// prettier-ignore
@Entity("hubs")
export class HubSchema extends CommonBase implements IActiveSubs {
  @Column({ type: 'uuid' }) user_id: string;
  @Column({ type: 'uuid' }) subscription_id: string;
  @Column({ type: 'timestamp' }) active_at: Date;

  @OneToOne(() => UserSchema)
  @JoinColumn({ name: 'user_id' })
  User: Relation<UserSchema>;

  @OneToOne(() => SubscriptionSchema)
  @JoinColumn({ name: 'subscription_id' })
  Subscription: Relation<SubscriptionSchema>;
}
