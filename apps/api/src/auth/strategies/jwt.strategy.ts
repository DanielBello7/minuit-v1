import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ValidUser } from '@/auth/types/auth.types';
import { Injectable } from '@nestjs/common';
import { CONSTANTS } from '@app/constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: CONSTANTS.JWT_SECRET,
      ignoreExpiration: false,
    });
  }
  validate(payload: ValidUser): ValidUser {
    return payload;
  }
}
