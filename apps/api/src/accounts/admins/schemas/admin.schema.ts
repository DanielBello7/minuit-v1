import { UserSchema } from '@/accounts/users/schemas/user.schema';
import { CommonBase } from '@app/util';
import { ADMIN_LEVEL_ENUM, IAdmin } from '@repo/types';
import { Column, Entity, JoinColumn, OneToOne, type Relation } from 'typeorm';

// prettier-ignore
@Entity("admins")
export class AdminSchema extends CommonBase implements IAdmin {
  @Column({ type: 'uuid' }) user_id: string;
  @Column({ type: 'enum', enum: ADMIN_LEVEL_ENUM }) level: ADMIN_LEVEL_ENUM;

  @OneToOne(() => UserSchema)
  @JoinColumn({ name: 'user_id' })
  User: Relation<UserSchema>;
}
