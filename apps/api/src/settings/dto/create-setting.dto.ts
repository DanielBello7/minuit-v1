import { BaseOmit, ISettings } from '@repo/types';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateSettingDto implements BaseOmit<ISettings> {
  @IsNotEmpty()
  @IsString()
  version: string;
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  max_free_alarms: number;
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  max_free_clocks: number;
}
