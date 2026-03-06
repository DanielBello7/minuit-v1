import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class InsertUserDto extends OmitType(CreateUserDto, [
  'avatar',
  'display_name',
  'is_email_verified',
  'has_password',
  'dark_mode',
  'is_onboarded',
  'last_login_date',
  'refresh_token',
]) {}
