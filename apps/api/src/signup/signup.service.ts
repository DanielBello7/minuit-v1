import { AdminsService } from '@/accounts/admins/admins.service';
import { InsertUserDto } from '@/accounts/users/dto/insert-user.dto';
import { UsersService } from '@/accounts/users/users.service';
import { AuthService } from '@/auth/auth.service';
import { OtpSchema } from '@/auth/schemas/otp.schema';
import { MutationsService } from '@app/mutations';
import { IMailModuleType, isValidDto } from '@app/util';
import { BadRequestException, Injectable } from '@nestjs/common';
import { OTP_PURPOSE_ENUM } from '@repo/types';
import { isPast } from 'date-fns';
import { SendVerifyOtpDto } from './dto/send-verify-otp.dto';
import { SetAvatarDto } from './dto/set-avatar.dto';
import { VerifyUserEmailDto } from './dto/verify-user-email.dto';
import { SignupAdminDto } from './dto/signup-admin.dto';

@Injectable()
export class SignupService {
  constructor(
    private readonly users: UsersService,
    private readonly admin: AdminsService,
    private readonly mutations: MutationsService,
    private readonly auth: AuthService,
    private readonly mail: IMailModuleType,
  ) {}

  /**
   * Registers a new user with the provided profile data.
   * @param body - User registration data (email, display name, etc.)
   * @returns The created user record
   */
  signup_users = async (body: InsertUserDto) => {
    return this.users.insert_other_user(body);
  };

  /**
   * Registers a new admin user and creates the associated user and admin records in a transaction.
   * @param body - Admin signup data including level and user profile fields
   * @returns The created admin record (and associated user)
   */
  signup_admin = async (body: SignupAdminDto) => {
    const errors = isValidDto(body, SignupAdminDto);
    if (errors.length > 0) throw new BadRequestException(errors);

    return this.mutations.execute(async (session) => {
      const { level, ...rest } = body;
      const user = await this.users.insert_admin(rest, session);
      return this.admin.insert_admin({ level, user_id: user.id }, session);
    });
  };

  /**
   * Sends a verification OTP to the user's email. Cleans up expired OTPs and reuses a valid one if present.
   * @param body - Contains the email address to send the OTP to
   * @returns `true` when the OTP was sent successfully
   * @throws BadRequestException if validation fails or the email is already verified
   */
  send_verify_otp = async (body: SendVerifyOtpDto) => {
    const error = isValidDto(body, SendVerifyOtpDto);
    if (error.length > 0) throw new BadRequestException(error);
    return this.mutations.execute(async (session) => {
      const user = await this.users.find_user_by_email(body.email, session);
      if (user.is_email_verified) {
        throw new BadRequestException('email already verified');
      }

      const check = await this.auth.get_user_otps(user.email, session);
      const expired: OtpSchema[] = [];
      const usefuls: OtpSchema[] = [];

      for (const a of check) {
        if (isPast(a.expires_at)) {
          expired.push(a);
          continue;
        }
        if (a.purpose === OTP_PURPOSE_ENUM.VERIFY) {
          usefuls.push(a);
          continue;
        }
      }

      if (expired.length > 0) {
        for (const a of expired) {
          await this.auth.delete_otp_by_id(a.id, session);
        }
      }

      if (usefuls.length > 0) {
        const main = usefuls[0];
        if (usefuls.length > 1) {
          for (const o of usefuls.slice(1)) {
            await this.auth.delete_otp_by_id(o.id, session);
          }
        }
        await this.mail.sendotp(main.value, body.email, user.display_name);
        return true;
      }

      const response = await this.auth.insert_otp(
        { email: body.email, purpose: OTP_PURPOSE_ENUM.VERIFY },
        session,
      );

      await this.mail.sendotp(response.value, body.email, user.display_name);
      return true;
    });
  };

  /**
   * Verifies the user's email using the provided OTP, marks the account as verified, and signs the user in.
   * @param body - Email and OTP code from the verification email
   * @returns The sign-in result (tokens/session) for the validated account
   * @throws BadRequestException if the OTP is expired, invalid, or does not match the email
   */
  verify_user_email = async (body: VerifyUserEmailDto) => {
    return this.mutations.execute(async (session) => {
      const user = await this.users.find_user_by_email(body.email, session);
      const otp = await this.auth.find_otp_by_otp(body.otp, session);

      if (isPast(otp.expires_at)) {
        await this.auth.delete_otp_by_id(otp.id, session);
        throw new BadRequestException('otp expired');
      }

      if (otp.value !== body.otp) {
        throw new BadRequestException('invalid credentials');
      }

      if (otp.purpose !== OTP_PURPOSE_ENUM.VERIFY) {
        throw new BadRequestException('invalid credentials');
      }

      if (otp.email !== body.email) {
        throw new BadRequestException('invalid credentials');
      }

      await this.auth.delete_otp_by_id(otp.id, session);
      await this.users.update_user(
        user.id,
        {
          is_email_verified: true,
        },
        session,
      );
      return this.auth.sign_in_validated_account(
        {
          email: user.email,
          id: user.id,
          name: user.display_name,
          type: user.type,
        },
        session,
      );
    });
  };

  /**
   * Verifies the user's email using the provided OTP and marks the account as verified, without signing the user in.
   * @param body - Email and OTP code from the verification email
   * @returns The updated user record with `is_email_verified: true`
   * @throws BadRequestException if the OTP is expired, invalid, or does not match the email
   */
  verify_user_email_no_signin = async (body: VerifyUserEmailDto) => {
    return this.mutations.execute(async (session) => {
      const user = await this.users.find_user_by_email(body.email, session);
      const otp = await this.auth.find_otp_by_otp(body.otp, session);

      if (isPast(otp.expires_at)) {
        await this.auth.delete_otp_by_id(otp.id, session);
        throw new BadRequestException('otp expired');
      }

      if (otp.value !== body.otp) {
        throw new BadRequestException('invalid credentials');
      }
      if (otp.purpose !== OTP_PURPOSE_ENUM.VERIFY) {
        throw new BadRequestException('invalid credentials');
      }
      if (otp.email !== body.email) {
        throw new BadRequestException('invalid credentials');
      }

      await this.auth.delete_otp_by_id(otp.id, session);
      return this.users.update_user(
        user.id,
        {
          is_email_verified: true,
        },
        session,
      );
    });
  };

  /**
   * Updates the avatar URL or value for a user.
   * @param body - User ID and the new avatar value (e.g. URL or storage key)
   * @returns The updated user record
   * @throws BadRequestException if validation fails
   */
  set_avatar = async (body: SetAvatarDto) => {
    const errors = isValidDto(body, SetAvatarDto);
    if (errors.length > 0) throw new BadRequestException(errors);
    return this.users.update_user(body.user_id, { avatar: body.value });
  };
}
