import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { JwtGuard } from '@/auth/guards';

UseGuards(JwtGuard);
@Controller('admins')
export class AdminsController {
  constructor(private readonly admins: AdminsService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.admins.find_by_id(id);
  }
}
