import { Module } from '@nestjs/common';
import { AlarmsService } from './alarms.service';
import { AlarmsController } from './alarms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlarmSchema } from './schemas/alarm.schema';
import { MutationsModule } from '@app/mutations';

@Module({
  exports: [AlarmsService],
  imports: [TypeOrmModule.forFeature([AlarmSchema]), MutationsModule],
  providers: [AlarmsService],
  controllers: [AlarmsController],
})
export class AlarmsModule {}
