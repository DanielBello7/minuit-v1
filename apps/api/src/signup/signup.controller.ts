import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SignupService } from './signup.service';
import { JwtGuard } from '@/auth/guards';
import { SendVerifyOtpDto } from './dto/send-verify-otp.dto';
import { SetAvatarDto } from './dto/set-avatar.dto';
import { VerifyUserEmailDto } from './dto/verify-user-email.dto';

@Controller('signup')
export class SignupController {
  constructor(private readonly signup: SignupService) {}

  @Post('signup/users')
  signup_user(@Body() body: any) {
    return this.signup.signup_users(body);
  }

  @UseGuards(JwtGuard)
  @Post('signup/admin')
  signup_admin(@Body() body: any) {
    return this.signup.signup_admin(body);
  }

  @Post('verify')
  verify_user_email(@Body() body: VerifyUserEmailDto) {
    return this.signup.verify_user_email(body);
  }

  @Post('verify/safe')
  verify_user_email_safe(@Body() body: VerifyUserEmailDto) {
    return this.signup.verify_user_email_no_signin(body);
  }

  @Post('verify/otp')
  send_verify_otp(@Body() body: SendVerifyOtpDto) {
    return this.signup.send_verify_otp(body);
  }

  @Post('set-avatar')
  set_user_avatar(@Body() body: SetAvatarDto) {
    return this.signup.set_avatar(body);
  }
}
