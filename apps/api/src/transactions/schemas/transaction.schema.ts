import { UserSchema } from '@/accounts/users/schemas/user.schema';
import { CONSTANTS } from '@app/constants';
import { CommonBase } from '@app/util';
import {
  CURRENCY_ENUM,
  ITransactions,
  TRANSACTION_STATUS_ENUM,
  TRANSACTION_TYPE_ENUM,
} from '@repo/types';
import { Column, Entity, JoinColumn, ManyToOne, type Relation } from 'typeorm';

// prettier-ignore
@Entity("transactions")
export class TransactionSchema extends CommonBase implements ITransactions {
  @Column({ type: 'varchar' }) narration: string;
  @Column({ type: 'uuid' }) user_id: string;
  @Column({ type: 'decimal', precision: 20, scale: CONSTANTS.AMOUNT_SCALE }) charge: string;
  @Column({ type: 'decimal', precision: 20, scale: CONSTANTS.AMOUNT_SCALE }) amount: string;
  @Column({ type: 'enum', enum: CURRENCY_ENUM }) currency: CURRENCY_ENUM;
  @Column({ type: 'varchar' }) gateway: string;
  @Column({ type: 'varchar' }) method: string;
  @Column({ type: 'enum', enum: TRANSACTION_TYPE_ENUM }) type: TRANSACTION_TYPE_ENUM;
  @Column({ type: 'enum', enum: TRANSACTION_STATUS_ENUM }) status: TRANSACTION_STATUS_ENUM;

  @ManyToOne(() => UserSchema)
  @JoinColumn({ name: "user_id" })
  User: Relation<UserSchema>
}
