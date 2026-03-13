import { CreateAdminDto } from '@/accounts/admins/dto/create-admin.dto';
import { InsertUserDto } from '@/accounts/users/dto/insert-user.dto';
import { ADMIN_LEVEL_ENUM } from '@repo/types';
import { IsNotEmpty, IsEnum } from 'class-validator';

export class SignupAdminDto extends InsertUserDto implements Pick<CreateAdminDto, 'level'> {
  @IsNotEmpty()
  @IsEnum(ADMIN_LEVEL_ENUM)
  level: ADMIN_LEVEL_ENUM;
}
