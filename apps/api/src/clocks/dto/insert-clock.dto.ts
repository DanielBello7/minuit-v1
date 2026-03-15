import { OmitType } from '@nestjs/mapped-types';
import { CreateClockDto } from './create-clock.dto';

export class InsertClockDto extends OmitType(CreateClockDto, ['is_active']) {}
