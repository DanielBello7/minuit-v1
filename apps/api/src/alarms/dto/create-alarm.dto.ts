import { Type } from 'class-transformer';
import {
  OneTimeRingAt,
  BaseOmit,
  IAlarm,
  SCHEDULE_TYPE,
  WEEKDAYS_ENUM,
  WeeklyRingAt,
} from '@repo/types';
import {
  ArrayMinSize,
  Equals,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsTimeZone,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class WeeklyRingAtDto implements WeeklyRingAt {
  @IsNotEmpty()
  @Equals(SCHEDULE_TYPE.WEEKLY)
  type: SCHEDULE_TYPE.WEEKLY;

  @IsNotEmpty()
  @IsEnum(WEEKDAYS_ENUM)
  weekday: WEEKDAYS_ENUM;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(23)
  hour: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(59)
  minute: number;

  @IsNotEmpty()
  @IsBoolean()
  is_active: boolean;
}

class OneTimeRingAtDto implements OneTimeRingAt {
  @IsNotEmpty()
  @Equals(SCHEDULE_TYPE.ONE_TIME)
  type: SCHEDULE_TYPE.ONE_TIME;

  @IsNotEmpty()
  @IsDateString()
  date: string; // e.g. "2026-03-13"

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(23)
  hour: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(59)
  minute: number;

  @IsNotEmpty()
  @IsBoolean()
  is_active: boolean;
}

export class CreateAlarmDto implements BaseOmit<IAlarm> {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => Object, {
    discriminator: {
      property: 'type',
      subTypes: [
        { name: SCHEDULE_TYPE.WEEKLY, value: WeeklyRingAtDto },
        { name: SCHEDULE_TYPE.ONE_TIME, value: OneTimeRingAtDto },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  @ValidateNested({ each: true })
  ring_at: (OneTimeRingAtDto | WeeklyRingAtDto)[];

  @IsNotEmpty()
  @IsBoolean()
  is_active: boolean;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  @IsString()
  region: string;

  @IsNotEmpty()
  @IsTimeZone()
  timezone: string;
}
