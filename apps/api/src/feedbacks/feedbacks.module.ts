import { Module } from '@nestjs/common';
import { FeedbacksService } from './feedbacks.service';
import { FeedbacksController } from './feedbacks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackSchema } from './schemas/feedback.schema';

@Module({
  imports: [TypeOrmModule.forFeature([FeedbackSchema])],
  exports: [FeedbacksService],
  providers: [FeedbacksService],
  controllers: [FeedbacksController],
})
export class FeedbacksModule {}
