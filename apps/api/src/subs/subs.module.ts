import { Module } from '@nestjs/common';
import { SubsService } from './subs.service';
import { SubsController } from './subs.controller';

@Module({
  controllers: [SubsController],
  providers: [SubsService],
})
export class SubsModule {}
