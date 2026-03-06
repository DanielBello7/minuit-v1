import {
  Param,
  Body,
  Controller,
  Patch,
  ParseUUIDPipe,
  Get,
  Post,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserSettingsDto } from './dto/user-settings/update-user-settings.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { SearchDto } from './dto/search.dto';
import { JwtGuard } from '@/auth/guards';
import { Public } from '@/auth/decorators/public.decorator';

@UseGuards(JwtGuard)
@UseInterceptors(ClassSerializerInterceptor) // optionally, you can add it here or at the bootstrap
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Patch(':ref')
  update_user(@Param('ref', ParseUUIDPipe) ref: string, @Body() body: UpdateUserDto) {
    return this.users.modify_user_by_id(ref, body);
  }

  @Get('search')
  search_users(@Query() query: SearchDto) {
    return this.users.search_by_email(query);
  }

  @Get('email/:email')
  get_user_by_email(@Param('email') email: string) {
    return this.users.find_user_by_email(email);
  }

  @Get(':ref')
  get_user_by_ref(@Param('ref') ref: string) {
    return this.users.find_by_ref(ref);
  }

  @Get(':ref/settings')
  get_user_settings(@Param('ref', ParseUUIDPipe) ref: string) {
    return this.users.get_user_settings_by_user_ref(ref);
  }

  @Public()
  @Get(':ref/status')
  get_user_status(@Param('ref', ParseUUIDPipe) ref: string) {
    return this.users.get_status_by_id(ref);
  }

  @Post('password')
  set_password(@Body() body: SetPasswordDto) {
    return this.users.set_password(body);
  }

  @Patch(':ref/password')
  update_password(@Body() body: UpdatePasswordDto, @Param('ref', ParseUUIDPipe) ref: string) {
    return this.users.update_password(ref, body);
  }

  @Patch(':ref/settings')
  update_user_settings(
    @Param('ref', ParseUUIDPipe) ref: string,
    @Body() body: UpdateUserSettingsDto,
  ) {
    return this.users.modify_user_settings_by_ref_id(ref, body);
  }
}
