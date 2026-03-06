import { OmitType } from '@nestjs/mapped-types';
import { InsertUserDto } from './insert-user.dto';

export class InsertAdminDto extends OmitType(InsertUserDto, ['type']) {}
