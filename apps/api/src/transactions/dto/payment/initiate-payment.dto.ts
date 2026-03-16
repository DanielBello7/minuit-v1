import {
  type IPaymentTxMetadata,
  TRANSACTION_TYPE_ENUM,
} from '@repo/types';
import { InsertTransactionDto } from '../insert-transaction.dto';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  ValidateNested,
} from 'class-validator';
import { OmitType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';

class PaymentTxMetadataDto implements IPaymentTxMetadata {
  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  ref_id: string | undefined;

  @IsNotEmpty()
  @IsUUID()
  package_id: string;
}

export class InitiatePaymentDto extends OmitType(InsertTransactionDto, [
  'charge',
]) {
  @IsNotEmpty()
  @Matches(TRANSACTION_TYPE_ENUM.PAYMENT)
  type: TRANSACTION_TYPE_ENUM.PAYMENT;

  @IsNotEmpty()
  @IsObject()
  @Type(() => PaymentTxMetadataDto)
  @ValidateNested()
  metadata: IPaymentTxMetadata;
}
