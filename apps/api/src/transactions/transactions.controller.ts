import { Controller, Get, ParseUUIDPipe, Query, UseGuards, Param } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { QueryTransactionByDatesDto } from './dto/query-transaction-by-dates.dto';
import { QueryTransactionByIndexDto } from './dto/query-transaction-by-index.dto';
import { JwtGuard } from '@/auth/guards';

@UseGuards(JwtGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactions: TransactionsService) {}

  @Get('by-dates')
  async get_by_dates(@Query() query: QueryTransactionByDatesDto) {
    return this.transactions.get_by_dates(query);
  }

  @Get('by-index')
  get_by_index(@Query() query: QueryTransactionByIndexDto) {
    return this.transactions.get_by_index(query);
  }

  @Get(':id')
  find_trx(@Param('id', ParseUUIDPipe) id: string) {
    return this.transactions.find_by_id(id);
  }
}
