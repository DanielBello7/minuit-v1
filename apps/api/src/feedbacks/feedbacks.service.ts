import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { Repository } from 'typeorm';
import { FeedbackSchema } from './schemas/feedback.schema';
import { InjectRepository } from '@nestjs/typeorm';
import { create_helper, isValidDto, paginate_by_date_helper, paginate_by_index } from '@app/util';
import { QueryFeedbackByDatesDto } from './dto/query-feedback-by-dates.dto';
import { QueryFeedbackByIndexDto } from './dto/query-feedback-by-index.dto';

@Injectable()
export class FeedbacksService {
  constructor(
    @InjectRepository(FeedbackSchema)
    private readonly feedback: Repository<FeedbackSchema>,
  ) {}

  create = async (body: CreateFeedbackDto) => {
    const error = isValidDto(body, CreateFeedbackDto);
    if (error.length > 0) throw new BadRequestException(error);
    return create_helper<FeedbackSchema>(this.feedback, body);
  };

  get_by_dates = async (query: Partial<QueryFeedbackByDatesDto> = {}) => {
    const errors = isValidDto(query, QueryFeedbackByDatesDto);
    if (errors.length > 0) throw new BadRequestException(errors);
    return paginate_by_date_helper(query, this.feedback);
  };

  get_by_index = async (query: Partial<QueryFeedbackByIndexDto> = {}) => {
    const errors = isValidDto(query, QueryFeedbackByIndexDto);
    if (errors.length > 0) throw new BadRequestException(errors);
    return paginate_by_index(query, this.feedback);
  };
}
