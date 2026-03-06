import { UserSchema } from '@/accounts/users/schemas/user.schema';
import { CommonBase } from '@app/util';
import { IFeedback } from '@repo/types';
import { Column, Entity, JoinColumn, ManyToOne, type Relation } from 'typeorm';

// prettier-ignore
@Entity('feedbacks')
export class FeedbackSchema extends CommonBase implements IFeedback {
  @Column({ type: 'uuid', nullable: true }) user_id?: string | undefined;
  @Column({ type: 'varchar' }) name: string;
  @Column({ type: 'varchar' }) message: string;
  @Column({ type: 'int', default: 0 }) rating: number;

  @ManyToOne(() => UserSchema, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  User: Relation<UserSchema | undefined>;
}
