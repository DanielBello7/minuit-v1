import { IsCurrencyCode, IsMoneyString } from '@app/util';
import {
  BaseOmit,
  type CurrencyCode,
  IPaymentTxMetadata,
  IRefundsTxMetadata,
  ITransactionsBase,
  TRANSACTION_STATUS_ENUM,
  TRANSACTION_TYPE_ENUM,
} from '@repo/types';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateTransactionDto implements BaseOmit<ITransactionsBase> {
  @IsOptional()
  @IsString()
  narration: string | undefined;
  @IsNotEmpty()
  @IsUUID()
  user_id: string;
  @IsNotEmpty()
  @IsMoneyString()
  charge: string;
  @IsNotEmpty()
  @IsMoneyString()
  amount: string;
  @IsNotEmpty()
  @IsCurrencyCode()
  currency_code: CurrencyCode;
  @IsOptional()
  @IsString()
  gateway: string | undefined;
  @IsOptional()
  @IsString()
  method: string | undefined;
  @IsNotEmpty()
  @IsEnum(TRANSACTION_TYPE_ENUM)
  type: TRANSACTION_TYPE_ENUM;
  @IsNotEmpty()
  @IsEnum(TRANSACTION_STATUS_ENUM)
  status: TRANSACTION_STATUS_ENUM;
  @IsNotEmpty()
  @IsObject()
  metadata: IPaymentTxMetadata | IRefundsTxMetadata;
  @IsNotEmpty()
  @IsDate()
  expires_at: Date;
}
