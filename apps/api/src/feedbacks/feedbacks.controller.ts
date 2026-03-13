import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { FeedbacksService } from './feedbacks.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { JwtGuard } from '@/auth/guards';
import { AllowRoles } from '@/auth/decorators/roles.decorator';
import { AccountType } from '@repo/types';
import { Public } from '@/auth/decorators/public.decorator';
import { QueryFeedbackByDatesDto } from './dto/query-feedback-by-dates.dto';
import { QueryFeedbackByIndexDto } from './dto/query-feedback-by-index.dto';

@AllowRoles(AccountType.Admins)
@UseGuards(JwtGuard)
@Controller('feedbacks')
export class FeedbacksController {
  constructor(private readonly feedback: FeedbacksService) {}

  @Public()
  @Post()
  give_feedback(@Body() body: CreateFeedbackDto) {
    return this.feedback.create(body);
  }

  @Get('by-dates')
  get_by_dates(query: QueryFeedbackByDatesDto) {
    return this.feedback.get_by_dates(query);
  }

  @Get('by-index')
  get_by_index(query: QueryFeedbackByIndexDto) {
    return this.feedback.get_by_index(query);
  }
}
