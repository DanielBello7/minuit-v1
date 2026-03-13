import { type IRefundsTxMetadata, TRANSACTION_TYPE_ENUM } from '@repo/types';
import { InsertTransactionDto } from '../insert-transaction.dto';
import {
  IsNotEmpty,
  IsObject,
  IsString,
  IsUUID,
  Matches,
  ValidateNested,
} from 'class-validator';
import { OmitType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';

class RefundsTxMetadataDto implements IRefundsTxMetadata {
  @IsNotEmpty()
  @IsUUID()
  og_trx_id: string;
  @IsNotEmpty()
  @IsString()
  reason: string;
}

export class InitiateRefundsDto extends OmitType(InsertTransactionDto, [
  'charge',
]) {
  @IsNotEmpty()
  @Matches(TRANSACTION_TYPE_ENUM.REFUNDS)
  type: TRANSACTION_TYPE_ENUM.REFUNDS;

  @IsNotEmpty()
  @IsObject()
  @Type(() => RefundsTxMetadataDto)
  @ValidateNested()
  metadata: IRefundsTxMetadata;
}
