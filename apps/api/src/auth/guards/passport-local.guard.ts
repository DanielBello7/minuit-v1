import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * this registers the use of the passport local guard
 */
@Injectable()
export class PassportLocalGuard extends AuthGuard('local') {}
