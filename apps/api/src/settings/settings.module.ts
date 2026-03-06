import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingSchema } from './schemas/setting.schema';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  providers: [SettingsService],
  controllers: [SettingsController],
  exports: [SettingsService],
  imports: [TypeOrmModule.forFeature([SettingSchema])],
})
export class SettingsModule {}
