import {
  Controller,
  Query,
  Get,
  Param,
  Post,
  Body,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { SubsService } from './subs.service';
import { QuerySubsByIndex } from './dto/query-sub.dto';
import { JwtGuard } from '@/auth/guards';
import { InsertSubDto } from './dto/insert-sub.dto';
import { CompletePaymentDto } from '@/transactions/dto/payment/complete-payment.dto';

@UseGuards(JwtGuard)
@Controller('subs')
export class SubsController {
  constructor(private readonly subs: SubsService) {}

  @Post('initiate-subscription')
  initiate_subscripton(@Body() body: InsertSubDto) {
    return this.subs.initiate_subscription_purchase(body);
  }

  @Post('get-free-package')
  get_free_package(@Body() body: InsertSubDto) {
    return this.subs.get_free_package(body);
  }

  @Post('complete-subscription')
  complete_subscripton(@Body() body: CompletePaymentDto) {
    return this.subs.complete_subscription_purchase(body);
  }

  @Get('by-index')
  get_by_index(@Query() query: QuerySubsByIndex) {
    return this.subs.get_subs_by_index(query);
  }

  @Get('users/:id')
  get_user_sub(@Param('id', ParseUUIDPipe) id: string) {
    return this.subs.find_hub_by_user_id(id);
  }

  @Get(':id')
  get_subscription_by_id(@Param('id', ParseUUIDPipe) id: string) {
    return this.subs.find_sub_by_id(id);
  }
}
