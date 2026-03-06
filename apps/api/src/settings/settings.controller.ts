import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AllowRoles } from '@/auth/decorators/roles.decorator';
import { JwtGuard } from '@/auth/guards';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { AccountType } from '@repo/types';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @UseGuards(JwtGuard)
  @Get()
  get_settings() {
    return this.settings.find();
  }

  @UseGuards(JwtGuard)
  @AllowRoles(AccountType.Admins)
  @Patch()
  update_settings(@Body() body: UpdateSettingDto) {
    return this.settings.update(body);
  }
}
