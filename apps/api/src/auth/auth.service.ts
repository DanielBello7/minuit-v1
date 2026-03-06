import { CONSTANTS } from '@app/constants';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as datefns from 'date-fns';
import { SigninDto } from './dto/signin.dto';
import { UsersService } from '@/accounts/users/users.service';
import { EntityManager, Repository } from 'typeorm';
import { OtpSchema } from './schemas/otp.schema';
import { InjectRepository } from '@nestjs/typeorm';
import { MutationsService } from '@app/mutations';
import { SigninResponse, ValidUser } from './types/auth.types';
import { CreateOtpDto } from './dto/otp/create-otp.dto';
import { create_helper, delete_helper, IMailModuleType, isValidDto } from '@app/util';
import { InsertOtp } from './dto/otp/insert-otp.dto';
import * as OTPs from 'otp-generator';
import { OTP_PURPOSE_ENUM } from '@repo/types';
import { SigninEmailDto } from './dto/signin-email.dto';
import { SigninOtpDto } from './dto/signin-otp.dto';
import { EmailDto } from './dto/email.dto';
import { RecoverDto } from './dto/recover.dto';
import { ValidateVerifyOtpDto } from './dto/validate-verify-otp.dto';

/**
 * Handles authentication flows: sign-in (password and OTP), sign-out, token refresh,
 * password recovery, and OTP creation/validation. Integrates with JWT, users, and mail.
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(OtpSchema)
    private readonly otp: Repository<OtpSchema>,
    private readonly jwt: JwtService,
    private readonly users: UsersService,
    private readonly mutation: MutationsService,
    private readonly mail: IMailModuleType,
  ) {}

  /**
   * Validates that an OTP is valid for password recovery: checks user has password,
   * OTP exists, is not expired, purpose is RECOVERY, and email matches.
   * @param body - Email and OTP value
   * @returns true if valid
   * @throws BadRequestException when validation fails
   */
  validate_verify_otp = async (body: ValidateVerifyOtpDto) => {
    const errors = isValidDto(body, ValidateVerifyOtpDto);
    if (errors.length > 0) throw new BadRequestException(errors);

    return this.mutation.execute(async (session) => {
      const user = await this.users.find_user_by_email(body.email, session);
      if (!user.has_password) {
        throw new BadRequestException('invalid credentials');
      }
      const token = await this.find_otp_by_otp(body.otp, session);
      if (datefns.isPast(token.expires_at)) {
        throw new BadRequestException('invalid otp');
      }
      if (token.purpose !== OTP_PURPOSE_ENUM.RECOVERY) {
        throw new BadRequestException('invalid otp');
      }
      if (token.email !== body.email) {
        throw new BadRequestException('invalid otp');
      }
      return true;
    });
  };

  /**
   * Creates and persists a new OTP: generates a 6-digit code, sets expiry to 2 hours,
   * and optionally runs within a transaction.
   * @param body - Email and purpose (e.g. LOGIN, RECOVERY, VERIFY)
   * @param session - Optional transaction manager
   * @returns Created OTP entity with value and id
   */
  insert_otp = async (body: InsertOtp, session?: EntityManager) => {
    const otp = OTPs.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      specialChars: false,
      upperCaseAlphabets: false,
    });
    return this.create_otp(
      {
        ...body,
        expires_at: datefns.addHours(new Date(), 2),
        value: otp,
      },
      session,
    );
  };

  /**
   * Deletes an OTP record by its id. Can run inside a transaction.
   * @param id - OTP entity id
   * @param session - Optional transaction manager
   */
  delete_otp_by_id = async (id: string, session?: EntityManager) => {
    return delete_helper(this.otp, id, session);
  };

  /**
   * Creates an OTP record from a DTO (validates and persists). Used when full OTP
   * payload is already built (e.g. value, expires_at, id).
   * @param body - CreateOtpDto with value, email, purpose, expires_at, etc.
   * @param session - Optional transaction manager
   * @returns Created OTP entity
   */
  create_otp = async (body: CreateOtpDto, session?: EntityManager) => {
    const errors = isValidDto(body, CreateOtpDto);
    if (errors.length > 0) throw new BadRequestException(errors);
    return create_helper<OtpSchema>(this.otp, body, session);
  };

  /**
   * First step of email-based sign-in: determines auth type (PASSWORD vs OTP).
   * If user has password, returns PASSWORD and display_name. Otherwise cleans expired
   * LOGIN OTPs, reuses or creates a LOGIN OTP, sends it by email, and returns OTP type.
   * @param body - Email address
   * @returns Object with type ('PASSWORD' | 'OTP') and display_name
   */
  signin_email_verify = async (body: SigninEmailDto) => {
    return this.mutation.execute(async (session) => {
      const user = await this.users.find_user_by_email(body.email, session);
      if (user.password) {
        return {
          type: 'PASSWORD',
          display_name: user.display_name,
        };
      }

      const check = await this.get_user_otps(user.email, session);
      const expired: OtpSchema[] = [];
      const usefuls: OtpSchema[] = [];

      for (const a of check) {
        if (datefns.isPast(a.expires_at)) {
          expired.push(a);
          continue;
        }
        if (a.purpose === OTP_PURPOSE_ENUM.LOGIN) {
          usefuls.push(a);
          continue;
        }
      }

      if (expired.length > 0) {
        for (const a of expired) {
          await this.delete_otp_by_id(a.id, session);
        }
      }

      if (usefuls.length > 0) {
        const main = usefuls[0];
        if (usefuls.length > 1) {
          for (const o of usefuls.slice(1)) {
            await this.delete_otp_by_id(o.id, session);
          }
        }
        await this.mail.sendotp(main.value, body.email, user.display_name);
        return {
          type: 'OTP',
          display_name: user.display_name,
        };
      }

      const response = await this.insert_otp(
        { email: body.email, purpose: OTP_PURPOSE_ENUM.LOGIN },
        session,
      );

      await this.mail.sendotp(response.value, body.email, user.display_name);
      return {
        type: 'OTP',
        display_name: user.display_name,
      };
    });
  };

  /**
   * Fetches all OTP records for a given email. Used to clean expired or duplicate OTPs.
   * @param email - User email
   * @param session - Optional transaction manager
   * @returns Array of OTP entities for that email
   */
  get_user_otps = async (email: string, session?: EntityManager) => {
    const db = session ? session.getRepository(this.otp.target) : this.otp;
    return db.find({
      where: { email },
    });
  };

  /**
   * Looks up an OTP by its value (the code the user enters). Throws if not found.
   * @param otp - OTP code string
   * @param session - Optional transaction manager
   * @returns OTP entity
   * @throws NotFoundException if no OTP with that value exists
   */
  find_otp_by_otp = async (otp: string, session?: EntityManager) => {
    const db = session ? session.getRepository(this.otp.target) : this.otp;
    const response = await db.findOne({
      where: { value: otp },
    });
    if (response) return response;
    throw new NotFoundException("otp doesn't exist");
  };

  /**
   * Second step of OTP sign-in: validates email + OTP (expiry, purpose LOGIN, email match),
   * deletes the OTP, marks user email as verified if needed, then issues tokens and user.
   * @param body - Email and OTP code
   * @returns SigninResponse with token, refresh, user, and expires
   * @throws BadRequestException when OTP is invalid or expired
   */
  signin_email_otp = async (body: SigninOtpDto) => {
    return this.mutation.execute(async (session) => {
      const user = await this.users.find_user_by_email(body.email, session);
      const otp = await this.find_otp_by_otp(body.otp, session);

      if (datefns.isPast(otp.expires_at)) {
        await this.delete_otp_by_id(otp.id, session);
        throw new BadRequestException('otp expired');
      }

      if (otp.value !== body.otp) {
        throw new BadRequestException('invalid credentials');
      }

      if (otp.purpose !== OTP_PURPOSE_ENUM.LOGIN) {
        throw new BadRequestException('invalid credentials');
      }
      if (otp.email !== body.email) {
        throw new BadRequestException('invalid credentials');
      }

      await this.delete_otp_by_id(otp.id, session);
      if (!user.is_email_verified) {
        await this.users.update_user(
          user.id,
          {
            is_email_verified: true,
          },
          session,
        );
      }
      return this.sign_in_validated_account(
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
   * Compares a plain-text input (e.g. password) with a bcrypt hash.
   * @param input - Plain text to check
   * @param hashed - Stored bcrypt hash
   * @returns true if input matches the hash
   */
  compare = (input: string, hashed: string): boolean => {
    return bcrypt.compareSync(input, hashed);
  };

  /**
   * Validates sign-in credentials (username/email + password). If user has a password,
   * compares it; otherwise returns user without password check. Used internally before
   * issuing tokens.
   * @param body - SigninDto with username and password
   * @param session - Optional transaction manager
   * @returns ValidUser if credentials are valid, null otherwise
   */
  validate = async (body: SigninDto, session?: EntityManager): Promise<ValidUser | null> => {
    const perform = async (em: EntityManager) => {
      const user = await this.users.find_user_by_email(body.username, em);
      if (user.password && user.has_password) {
        if (!this.compare(body.password, user.password)) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.display_name,
          type: user.type,
        } satisfies ValidUser;
      }
      return {
        id: user.id,
        email: user.email,
        name: user.display_name,
        type: user.type,
      } satisfies ValidUser;
    };

    if (session) return perform(session);
    else return this.mutation.execute(perform);
  };

  /**
   * Issues JWT access and refresh tokens for an already-validated user. Updates user
   * settings with last_login_date and refresh_token, then returns tokens and user payload.
   * @param body - ValidUser (id, email, name, ref, type)
   * @param session - Optional transaction manager
   * @returns SigninResponse with token, refresh, user, and expires
   */
  sign_in_validated_account = async (
    body: ValidUser,
    session?: EntityManager,
  ): Promise<SigninResponse> => {
    const perform = async (em: EntityManager) => {
      const token = await this.jwt.signAsync(body);
      const refresh = await this.jwt.signAsync(body, {
        expiresIn: CONSTANTS.JWT_EXPIRES_IN as any,
      });

      const exp = datefns.addHours(new Date(), parseInt(CONSTANTS.JWT_EXPIRES_IN, 10));
      await this.users.update_user(
        body.id,
        {
          last_login_date: new Date(),
          refresh_token: refresh,
        },
        em,
      );

      const user = await this.users.find_by_id_lock(body.id, em);
      return {
        token,
        refresh,
        user: {
          id: user.id,
          avatar: user.avatar,
          created_at: user.created_at,
          display_name: user.display_name,
          email: user.email,
          type: user.type,
          is_email_verified: user.is_email_verified,
        },
        expires: exp,
      } satisfies SigninResponse;
    };

    if (session) return perform(session);
    return this.mutation.execute(perform);
  };

  /**
   * Full password sign-in: validates credentials then issues tokens. Throws if invalid.
   * @param body - SigninDto with username and password
   * @returns SigninResponse
   * @throws UnauthorizedException when credentials are invalid
   */
  authenticate = async (body: SigninDto) => {
    return this.mutation.execute(async (session) => {
      const response = await this.validate(body, session);
      if (!response) throw new UnauthorizedException('Invalid credentials');
      return this.sign_in_validated_account(response, session);
    });
  };

  /**
   * Returns the user profile for the given user id (e.g. current user from JWT).
   * @param id - User entity id
   * @returns User entity
   */
  whoami = async (id: string) => {
    return this.users.find_user_by_id(id);
  };

  /**
   * Signs out the user identified by id: clears refresh_token in user settings
   * so the refresh token can no longer be used.
   * @param id - User id (from JWT)
   * @returns User entity after update
   */
  sign_out = async (id: string) => {
    return this.mutation.execute(async (session) => {
      const user = await this.users.find_by_id_lock(id, session);
      await this.users.update_user(user.id, { refresh_token: null as any }, session);
      return user;
    });
  };

  /**
   * Verifies a JWT access token and returns the payload (ValidUser). Does not check
   * refresh token or DB; use for validating Bearer token only.
   * @param token - JWT string
   * @returns ValidUser payload or null if token is invalid/expired
   */
  confirm_auth = async (token: string): Promise<ValidUser | null> => {
    try {
      const response: ValidUser = await this.jwt.verifyAsync(token);
      return response;
    } catch {
      return null;
    }
  };

  /**
   * Exchanges a valid refresh token for new access and refresh tokens. Verifies that
   * the provided refresh string matches the one stored for the user, then re-issues
   * sign-in tokens.
   * @param useremail - User email (from client)
   * @param refresh - Refresh token string from client
   * @returns New SigninResponse with fresh tokens
   * @throws NotFoundException when refresh token is missing or does not match
   */
  generate_refresh = async (useremail: string, refresh: string) => {
    return this.mutation.execute(async (session) => {
      const user = await this.users.find_user_by_email(useremail, session);
      if (!user.refresh_token) {
        throw new NotFoundException('cannot find refresh');
      }
      if (refresh !== user.refresh_token) {
        throw new NotFoundException('cannot find refresh');
      }
      await this.jwt.verify(user.refresh_token);
      return this.sign_in_validated_account(
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
   * First step of password recovery: ensures user has password auth, creates a RECOVERY
   * OTP, sends it by email. Call this before prompting for OTP and new password.
   * @param body - Email address
   * @returns true on success
   * @throws BadRequestException if user has no password set
   */
  recovery_verify = async (body: EmailDto) => {
    const errors = isValidDto(body, EmailDto);
    if (errors.length > 0) throw new BadRequestException(errors);
    return this.mutation.execute(async (session) => {
      const user = await this.users.find_user_by_email(body.email, session);
      if (!user.password) {
        throw new BadRequestException('error recovering user password');
      }
      const token = await this.insert_otp(
        { email: body.email, purpose: OTP_PURPOSE_ENUM.RECOVERY },
        session,
      );
      await this.mail.sendotp(token.value, user.email, user.display_name);
      return true;
    });
  };

  /**
   * Completes password recovery: validates OTP (RECOVERY, not expired, email match),
   * deletes OTP, ensures new password differs from current, hashes and updates password.
   * @param body - Email, OTP code, and new password
   * @returns Updated user entity
   * @throws BadRequestException when OTP invalid, expired, or new password same as old
   */
  recover = async (body: RecoverDto) => {
    const errors = isValidDto(body, RecoverDto);
    if (errors.length > 0) throw new BadRequestException(errors);
    return this.mutation.execute(async (session) => {
      const user = await this.users.find_user_by_email(body.email, session);
      if (!user.password) {
        throw new BadRequestException('password auth not avaialble for this user');
      }
      const token = await this.find_otp_by_otp(body.otp, session);
      if (datefns.isPast(token.expires_at)) {
        throw new BadRequestException('otp expired');
      }
      if (token.purpose !== OTP_PURPOSE_ENUM.RECOVERY) {
        throw new BadRequestException('invalid otp');
      }
      if (token.email !== body.email) {
        throw new BadRequestException('invalid otp');
      }

      await this.delete_otp_by_id(token.id, session);
      if (bcrypt.compareSync(body.password, user.password)) {
        throw new BadRequestException('new password cannot be the same as old password');
      }
      const hashed = bcrypt.hashSync(body.password);
      return this.users.update_user(
        user.id,
        {
          password: hashed,
        },
        session,
      );
    });
  };
}
