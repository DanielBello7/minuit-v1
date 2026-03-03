import { PartialType } from '@nestjs/mapped-types';
import { CreateClockDto } from './create-clock.dto';

export class UpdateClockDto extends PartialType(CreateClockDto) {}
