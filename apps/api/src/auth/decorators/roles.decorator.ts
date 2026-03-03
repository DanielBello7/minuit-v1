import { AccountType } from '@repo/types';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'ROLES';
export const AllowRoles = (...roles: AccountType[]) =>
  SetMetadata(ROLES_KEY, roles);
