import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionSchema } from './schemas/transaction.schema';
import { MutationsModule } from '@app/mutations';
import { SettingsModule } from '@/settings/settings.module';
import { UsersModule } from '@/accounts/users/users.module';

@Module({
  exports: [TransactionsService],
  imports: [
    TypeOrmModule.forFeature([TransactionSchema]),
    MutationsModule,
    SettingsModule,
    UsersModule,
  ],
  providers: [TransactionsService],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
