import { OmitType } from '@nestjs/mapped-types';
import { CreateAlarmDto } from './create-alarm.dto';

export class InsertAlarmDto extends OmitType(CreateAlarmDto, ['is_active']) {}
