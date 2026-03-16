import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SubsService } from './subs.service';
import { CreateSubDto } from './dto/create-sub.dto';
import { UpdateSubDto } from './dto/update-sub.dto';

@Controller('subs')
export class SubsController {
  constructor(private readonly subsService: SubsService) {}

  @Post()
  create(@Body() createSubDto: CreateSubDto) {
    return this.subsService.create_sub(createSubDto);
  }

  @Get()
  findAll() {
    return this.subsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subsService.find_sub_by_id(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubDto: UpdateSubDto) {
    return this.subsService.update_sub_by_id(+id, updateSubDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subsService.remove(+id);
  }
}
