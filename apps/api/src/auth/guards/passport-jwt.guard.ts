import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * this registers the use of passport jwt guard
 * with the whole application
 */
@Injectable()
export class PassportJwtGuard extends AuthGuard('jwt') {}
