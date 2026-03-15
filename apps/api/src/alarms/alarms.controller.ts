import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AlarmsService } from './alarms.service';
import { UpdateAlarmDto } from './dto/update-alarm.dto';
import { JwtGuard } from '@/auth/guards';
import { QueryAlarmsByPage } from './dto/query-alarm.dto';
import { InsertAlarmDto } from './dto/insert-alarm.dto';

@UseGuards(JwtGuard)
@Controller('alarms')
export class AlarmsController {
  constructor(private readonly alarms: AlarmsService) {}

  @Get(':id')
  find_by_id(@Param('id', ParseUUIDPipe) id: string) {
    return this.alarms.find_by_id(id);
  }

  @Post()
  create(@Body() body: InsertAlarmDto) {
    return this.alarms.insert(body);
  }

  @Get('by-page')
  get_by_pages(@Query() query: QueryAlarmsByPage) {
    return this.alarms.get_by_page(query);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateAlarmDto) {
    return this.alarms.modify(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.alarms.remove(id);
  }
}
