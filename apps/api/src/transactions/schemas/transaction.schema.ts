import { UserSchema } from '@/accounts/users/schemas/user.schema';
import { CONSTANTS } from '@app/constants';
import { CommonBase } from '@app/util';
import {
  type CurrencyCode,
  IPaymentTxMetadata,
  IRefundsTxMetadata,
  ITransactionsBase,
  TRANSACTION_STATUS_ENUM,
  TRANSACTION_TYPE_ENUM,
} from '@repo/types';
import { Column, Entity, JoinColumn, ManyToOne, type Relation } from 'typeorm';

// prettier-ignore
@Entity("transactions")
export class TransactionSchema extends CommonBase implements ITransactionsBase {
  @Column({ type: 'varchar', nullable: true }) narration: string | undefined;
  @Column({ type: 'uuid' }) user_id: string;
  @Column({ type: 'decimal', precision: 20, scale: CONSTANTS.AMOUNT_SCALE }) charge: string;
  @Column({ type: 'decimal', precision: 20, scale: CONSTANTS.AMOUNT_SCALE }) amount: string;
  @Column({ type: 'varchar' }) currency_code: CurrencyCode;
  @Column({ type: 'varchar', nullable: true }) gateway: string | undefined
  @Column({ type: 'varchar', nullable: true }) method: string | undefined;
  @Column({ type: 'enum', enum: TRANSACTION_TYPE_ENUM }) type: TRANSACTION_TYPE_ENUM;
  @Column({ type: 'enum', enum: TRANSACTION_STATUS_ENUM }) status: TRANSACTION_STATUS_ENUM;
  @Column({ type: 'jsonb' }) metadata: IPaymentTxMetadata | IRefundsTxMetadata
  @Column({ type: 'timestamp' }) expires_at: Date;

  @ManyToOne(() => UserSchema)
  @JoinColumn({ name: "user_id" })
  User: Relation<UserSchema>
}
