import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ROLES_KEY } from '@/auth/decorators/roles.decorator';
import { AccountType } from '@repo/types';
import { Reflector } from '@nestjs/core';
import { ReqExpress, ValidUser } from '@/auth/types/auth.types';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const required = this.reflector.getAllAndOverride<AccountType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required) return true;

    const request: ReqExpress = context.switchToHttp().getRequest();
    const user: ValidUser = request.user as ValidUser;
    if (matchRole(required, user.type)) {
      return true;
    }
    throw new ForbiddenException();
  }
}

function matchRole(valid: AccountType[], input: AccountType) {
  if (valid.includes(input)) return true;
  return false;
}
