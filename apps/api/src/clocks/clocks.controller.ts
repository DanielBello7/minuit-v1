import {
  Controller,
  Get,
  ParseUUIDPipe,
  Post,
  Param,
  Patch,
  Body,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClocksService } from './clocks.service';
import { UpdateClockDto } from './dto/update-clock.dto';
import { QueryClocksByPage } from './dto/query-clocks-by-index.dto';
import { InsertClockDto } from './dto/insert-clock.dto';
import { JwtGuard } from '@/auth/guards';

@UseGuards(JwtGuard)
@Controller('clocks')
export class ClocksController {
  constructor(private readonly clocks: ClocksService) {}

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateClockDto) {
    return this.clocks.update(id, body);
  }

  @Post()
  create(@Body() body: InsertClockDto) {
    return this.clocks.insert(body);
  }

  @Get('by-page')
  get_by_page(@Query() query: QueryClocksByPage) {
    return this.clocks.get_by_pages(query);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.clocks.remove(id);
  }
}
