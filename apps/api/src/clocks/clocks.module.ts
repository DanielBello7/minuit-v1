import { Module } from '@nestjs/common';
import { ClocksService } from './clocks.service';
import { ClocksController } from './clocks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClockSchema } from './schemas/clock.schema';
import { MutationsModule } from '@app/mutations';

@Module({
  exports: [ClocksService],
  imports: [TypeOrmModule.forFeature([ClockSchema]), MutationsModule],
  providers: [ClocksService],
  controllers: [ClocksController],
})
export class ClocksModule {}
