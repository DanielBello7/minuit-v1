import { OmitType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from './create-transaction.dto';

export class InsertTransactionDto extends OmitType(CreateTransactionDto, [
  'method',
  'gateway',
  'narration',
  'status',
  'expires_at',
]) {}
