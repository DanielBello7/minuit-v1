import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './accounts/users/users.module';
import { AdminsModule } from './accounts/admins/admins.module';
import { PricingsModule } from './pricings/pricings.module';
import { SubsModule } from './subs/subs.module';
import { AlarmsModule } from './alarms/alarms.module';
import { ClocksModule } from './clocks/clocks.module';
import { FeedbacksModule } from './feedbacks/feedbacks.module';

@Module({
  imports: [UsersModule, AdminsModule, PricingsModule, SubsModule, AlarmsModule, ClocksModule, FeedbacksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
