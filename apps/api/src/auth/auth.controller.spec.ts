import * as bcrypt from 'bcryptjs';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthModule } from './auth.module';
import { UserSchema } from '@/accounts/users/schemas/user.schema';
import { OtpSchema } from './schemas/otp.schema';
import { UsersService } from '@/accounts/users/users.service';
import { IMailModuleType } from '@app/util';
import { AccountType, OTP_PURPOSE_ENUM } from '@repo/types';
import { CreateUserDto } from '@/accounts/users/dto/create-user.dto';
import { SigninEmailDto } from './dto/signin-email.dto';
import { SigninOtpDto } from './dto/signin-otp.dto';
import { EmailDto } from './dto/email.dto';
import { RecoverDto } from './dto/recover.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ValidateVerifyOtpDto } from './dto/validate-verify-otp.dto';
import { CONSTANTS } from '@app/constants';
import { MutationsModule } from '@app/mutations';
import { UsersModule } from '@/accounts/users/users.module';
import { PostgresTestContainer } from '@test/helpers/pg-test-container';
import { BrevoModule } from '@app/brevo';
import type { ReqExpress } from './types/auth.types';

const TEST_JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

describe('AuthController (integration)', () => {
  const pg = new PostgresTestContainer();
  const createUserDto: CreateUserDto = {
    firstname: 'Test',
    surname: 'User',
    email: 'test@example.com',
    username: 'testuser',
    timezone: 'UTC',
    display_name: 'Test User',
    type: AccountType.Client,
    is_email_verified: false,
    has_password: true,
    dark_mode: false,
    is_onboarded: false,
    password: undefined,
    avatar: undefined,
    refresh_token: undefined,
    last_login_date: undefined,
  };

  const mailMock = {
    sendotp: jest.fn().mockResolvedValue(undefined),
    sendmail: jest.fn().mockResolvedValue(undefined),
  };

  let app: TestingModule;
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;
  let dataSource: DataSource;

  beforeAll(async () => {
    await pg.start();
    (CONSTANTS as any).JWT_EXPIRES_IN = '24h';

    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          pg.getTypeOrmOptions({
            entities: [UserSchema, OtpSchema],
          }),
        ),
        JwtModule.register({
          global: true,
          secret: TEST_JWT_SECRET,
          signOptions: { expiresIn: 86400 }, // 24h in seconds
        }),
        BrevoModule.register({
          apiKy: 'test-key',
          email: 'test@example.com',
          ename: 'Test',
        }),
        AuthModule,
        UsersModule,
        MutationsModule,
      ],
    })
      .overrideProvider(IMailModuleType)
      .useValue(mailMock)
      .compile();

    controller = app.get(AuthController);
    authService = app.get(AuthService);
    usersService = app.get(UsersService);
    dataSource = app.get(getDataSourceToken());
  }, 60_000);

  afterAll(async () => {
    await dataSource?.destroy();
    await app?.close();
    await pg.stop();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const otpRepo = dataSource.getRepository(OtpSchema);
    const usrRepo = dataSource.getRepository(UserSchema);
    await otpRepo.clear();
    await usrRepo.clear();
  });

  async function createUserWithPassword(
    overrides: Partial<CreateUserDto> & { password?: string } = {},
  ): Promise<{ id: string; email: string; password: string }> {
    const plainPassword = overrides.password ?? 'password123';
    const hashed = bcrypt.hashSync(plainPassword, CONSTANTS.HASH ?? 10);
    const dto: CreateUserDto = {
      ...createUserDto,
      ...overrides,
      password: hashed,
      has_password: true,
      is_email_verified: overrides.is_email_verified ?? false,
    };
    const user = await usersService.create_user(dto);
    return { id: user.id, email: user.email, password: plainPassword };
  }

  async function createUserWithoutPassword(
    overrides: Partial<CreateUserDto> = {},
  ): Promise<{ id: string; email: string }> {
    const dto: CreateUserDto = {
      ...createUserDto,
      ...overrides,
      password: undefined,
      has_password: false,
    };
    const user = await usersService.create_user(dto);
    return { id: user.id, email: user.email };
  }

  function reqWithUser(id: string, email: string, token?: string): ReqExpress {
    return {
      user: {
        id,
        email,
        name: 'Test User',
        type: AccountType.Client,
        ...(token && { token }),
      },
    } as ReqExpress;
  }

  describe('sign_in_password', () => {
    it('returns signin response when req.user is set by guard', async () => {
      const { id, email, password } = await createUserWithPassword();
      const signIn = await authService.authenticate({
        username: email,
        password,
      } as any);
      const validUser = { id, email, name: 'Test User', type: AccountType.Client };
      const req = reqWithUser(id, email);
      (req as any).user = validUser;

      const result = await controller.sign_in_password(req);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refresh');
      expect(result.user.email).toBe(email);
    });

    it('propagates service errors', async () => {
      const req = reqWithUser('non-existent-id', 'nobody@example.com');

      await expect(controller.sign_in_password(req)).rejects.toThrow();
    });
  });

  describe('sign_out', () => {
    it('clears refresh token and returns user', async () => {
      const { id, email, password } = await createUserWithPassword();
      await authService.authenticate({ username: email, password } as any);
      const req = reqWithUser(id, email, 'any-token');

      const result = await controller.sign_out(req);

      expect(result.id).toBe(id);
      const userAfter = await usersService.find_user_by_id(id);
      expect(userAfter.refresh_token).toBeNull();
    });
  });

  describe('whoami', () => {
    it('returns current user by id from req.user', async () => {
      const { id, email } = await createUserWithPassword();
      const req = reqWithUser(id, email);

      const result = await controller.whoami(req);

      expect(result.id).toBe(id);
      expect(result.email).toBe(email);
      expect(result.display_name).toBe('Test User');
    });

    it('propagates NotFound when user id does not exist', async () => {
      const req = reqWithUser('00000000-0000-0000-0000-000000000000', 'nobody@example.com');

      await expect(controller.whoami(req)).rejects.toThrow();
    });
  });

  describe('refresh', () => {
    it('returns new tokens when refresh matches', async () => {
      const { email, password } = await createUserWithPassword();
      const signIn = await authService.authenticate({ username: email, password } as any);
      const payload: RefreshDto = { email, refresh: signIn.refresh };

      const result = await controller.refresh(payload);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refresh');
      expect(result.user.email).toBe(email);
    });

    it('propagates error when refresh invalid', async () => {
      const { email } = await createUserWithPassword({ email: 'r@example.com' });

      await expect(controller.refresh({ email, refresh: 'invalid-refresh' })).rejects.toThrow(
        'cannot find refresh',
      );
    });
  });

  describe('signin_otp_verify', () => {
    it('returns PASSWORD type when user has password', async () => {
      await createUserWithPassword({ email: 'pwd@example.com' });

      const result = await controller.signin_otp_verify({
        email: 'pwd@example.com',
      } as SigninEmailDto);

      expect(result).toEqual({ type: 'PASSWORD', display_name: 'Test User' });
    });

    it('returns OTP type and sends OTP when user has no password', async () => {
      await createUserWithoutPassword({ email: 'otp@example.com' });

      const result = await controller.signin_otp_verify({
        email: 'otp@example.com',
      } as SigninEmailDto);

      expect(result.type).toBe('OTP');
      expect(mailMock.sendotp).toHaveBeenCalled();
    });
  });

  describe('signin_otp', () => {
    it('signs in with valid OTP and returns tokens', async () => {
      await createUserWithoutPassword({ email: 'otpuser@example.com' });
      await controller.signin_otp_verify({ email: 'otpuser@example.com' } as SigninEmailDto);
      const sentOtp = (mailMock.sendotp as jest.Mock).mock.calls[0][0];

      const result = await controller.signin_otp({
        email: 'otpuser@example.com',
        otp: sentOtp,
      } as SigninOtpDto);

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('otpuser@example.com');
    });

    it('propagates error for wrong OTP', async () => {
      await createUserWithoutPassword({ email: 'otp2@example.com' });
      await controller.signin_otp_verify({ email: 'otp2@example.com' } as SigninEmailDto);

      await expect(
        controller.signin_otp({
          email: 'otp2@example.com',
          otp: '000000',
        } as SigninOtpDto),
      ).rejects.toThrow();
    });
  });

  describe('verify_recovery_account', () => {
    it('sends recovery OTP and returns true', async () => {
      await createUserWithPassword({ email: 'recover@example.com' });

      const result = await controller.verify_recovery_account({
        email: 'recover@example.com',
      } as EmailDto);

      expect(result).toBe(true);
      expect(mailMock.sendotp).toHaveBeenCalled();
    });

    it('propagates error when user has no password', async () => {
      await createUserWithoutPassword({ email: 'nopwd@example.com' });

      await expect(
        controller.verify_recovery_account({ email: 'nopwd@example.com' } as EmailDto),
      ).rejects.toThrow('error recovering user password');
    });
  });

  describe('validate_recovery_account', () => {
    it('returns true for valid recovery OTP', async () => {
      await createUserWithPassword({ email: 'v@example.com' });
      await controller.verify_recovery_account({ email: 'v@example.com' } as EmailDto);
      const otp = (mailMock.sendotp as jest.Mock).mock.calls[0][0];

      const result = await controller.validate_recovery_account({
        email: 'v@example.com',
        otp,
      } as ValidateVerifyOtpDto);

      expect(result).toBe(true);
    });

    it('propagates error for invalid OTP (user has no password)', async () => {
      await createUserWithoutPassword({ email: 'vnopwd@example.com' });
      const otpEntity = await authService.insert_otp({
        email: 'vnopwd@example.com',
        purpose: OTP_PURPOSE_ENUM.RECOVERY,
      });

      await expect(
        controller.validate_recovery_account({
          email: 'vnopwd@example.com',
          otp: otpEntity.value,
        } as ValidateVerifyOtpDto),
      ).rejects.toThrow('invalid credentials');
    });
  });

  describe('recover_account', () => {
    it('updates password and returns user', async () => {
      await createUserWithPassword({
        email: 'recoverfinal@example.com',
        password: 'oldpass123',
      });
      await controller.verify_recovery_account({
        email: 'recoverfinal@example.com',
      } as EmailDto);
      const otp = (mailMock.sendotp as jest.Mock).mock.calls[0][0];

      const result = await controller.recover_account({
        email: 'recoverfinal@example.com',
        otp,
        password: 'newpass456',
      } as RecoverDto);

      expect(result.id).toBeDefined();
      const userAfter = await usersService.find_user_by_email('recoverfinal@example.com');
      expect(bcrypt.compareSync('newpass456', userAfter.password!)).toBe(true);
    });

    it('propagates error when new password same as old', async () => {
      await createUserWithPassword({
        email: 'same@example.com',
        password: 'samepass',
      });
      await controller.verify_recovery_account({ email: 'same@example.com' } as EmailDto);
      const otp = (mailMock.sendotp as jest.Mock).mock.calls[0][0];

      await expect(
        controller.recover_account({
          email: 'same@example.com',
          otp,
          password: 'samepass',
        } as RecoverDto),
      ).rejects.toThrow('new password cannot be the same as old password');
    });
  });
});
