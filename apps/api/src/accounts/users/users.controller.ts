import { Param, Body, Controller, Patch, ParseUUIDPipe, Get, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { SearchDto } from './dto/search.dto';
import { Public } from '@/auth/decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Patch(':id')
  update_user(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateUserDto) {
    return this.users.modify_user_by_id(id, body);
  }

  @Get('search')
  search_users(@Query() query: SearchDto) {
    return this.users.search_by_email(query);
  }

  @Get('email/:email')
  get_user_by_email(@Param('email') email: string) {
    return this.users.find_user_by_email(email);
  }

  @Get(':id')
  get_user_by_id(@Param('id') id: string) {
    return this.users.find_user_by_id(id);
  }

  @Public()
  @Get(':id/status')
  get_user_status(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.get_status_by_id(id);
  }

  @Post('password')
  set_password(@Body() body: SetPasswordDto) {
    return this.users.set_password(body);
  }

  @Patch(':id/password')
  update_password(@Body() body: UpdatePasswordDto, @Param('id', ParseUUIDPipe) id: string) {
    return this.users.update_password(id, body);
  }
}
