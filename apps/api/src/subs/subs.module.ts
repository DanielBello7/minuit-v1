import { Module } from '@nestjs/common';
import { SubsService } from './subs.service';
import { SubsController } from './subs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionSchema } from './schemas/subs.schema';
import { HubSchema } from './schemas/hubs.schema';
import { MutationsModule } from '@app/mutations';
import { TransactionsModule } from '@/transactions/transactions.module';
import { PackagesModule } from '@/packages/packages.module';
import { UsersModule } from '@/accounts/users/users.module';

@Module({
  exports: [SubsService],
  imports: [
    TypeOrmModule.forFeature([SubscriptionSchema, HubSchema]),
    MutationsModule,
    PackagesModule,
    TransactionsModule,
    UsersModule,
  ],
  providers: [SubsService],
  controllers: [SubsController],
})
export class SubsModule {}
