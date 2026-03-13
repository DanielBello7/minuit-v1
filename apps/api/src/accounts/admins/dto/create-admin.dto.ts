import { ADMIN_LEVEL_ENUM, BaseOmit, IAdmin } from '@repo/types';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateAdminDto implements BaseOmit<IAdmin> {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;
  @IsNotEmpty()
  @IsEnum(ADMIN_LEVEL_ENUM)
  level: ADMIN_LEVEL_ENUM;
}
