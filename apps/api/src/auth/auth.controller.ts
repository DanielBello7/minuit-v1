import { JwtGuard, PassportLocalGuard } from '@/auth/guards';
import { ReqExpress } from '@/auth/types/auth.types';
import { AuthService } from './auth.service';
import { RefreshDto } from './dto/refresh.dto';
import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SigninEmailDto } from './dto/signin-email.dto';
import { SigninOtpDto } from './dto/signin-otp.dto';
import { EmailDto } from './dto/email.dto';
import { RecoverDto } from './dto/recover.dto';
import { ValidateVerifyOtpDto } from './dto/validate-verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @UseGuards(PassportLocalGuard)
  @Post('signin/password')
  sign_in_password(@Request() req: ReqExpress) {
    return this.auth.sign_in_validated_account(req.user);
  }

  @UseGuards(JwtGuard)
  @Post('signout')
  sign_out(@Request() req: ReqExpress) {
    return this.auth.sign_out(req.user.token);
  }

  @UseGuards(JwtGuard)
  @Get('whoami')
  whoami(@Request() req: ReqExpress) {
    return this.auth.whoami(req.user.id);
  }

  @Post('refresh')
  refresh(@Body() payload: RefreshDto) {
    return this.auth.generate_refresh(payload.email, payload.refresh);
  }

  @Post('signin/verify')
  signin_otp_verify(@Body() body: SigninEmailDto) {
    return this.auth.signin_email_verify(body);
  }

  @Post('signin/otp')
  signin_otp(@Body() body: SigninOtpDto) {
    return this.auth.signin_email_otp(body);
  }

  @Post('recover/verify')
  verify_recovery_account(@Body() body: EmailDto) {
    return this.auth.recovery_verify(body);
  }

  @Post('recover/validate')
  validate_recovery_account(@Body() body: ValidateVerifyOtpDto) {
    return this.auth.validate_verify_otp(body);
  }

  @Post('recover/password')
  recover_account(@Body() body: RecoverDto) {
    return this.auth.recover(body);
  }
}
