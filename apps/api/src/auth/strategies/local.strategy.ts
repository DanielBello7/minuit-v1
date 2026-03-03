import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '@/auth/auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly auth: AuthService) {
    super({
      passwordField: 'password',
      usernameField: 'username',
    });
  }

  async validate(username: string, password: string) {
    const response = await this.auth.validate({
      username: username,
      password,
    });
    if (response) return response;
    throw new UnauthorizedException('Invalid credentials');
  }
}
