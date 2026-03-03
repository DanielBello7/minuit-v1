import { Module } from '@nestjs/common';
import { MutationsService } from './mutations.service';

@Module({
  providers: [MutationsService],
  exports: [MutationsService],
})
export class MutationsModule {}
