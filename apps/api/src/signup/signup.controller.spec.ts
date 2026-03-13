/**
 * Integration tests for SignupController using Postgres test container.
 * Real SignupService and controller; mail mocked; controller methods called directly.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { SignupController } from './signup.controller';
import { SignupModule } from './signup.module';
import { UserSchema } from '@/accounts/users/schemas/user.schema';
import { AdminSchema } from '@/accounts/admins/schemas/admin.schema';
import { OtpSchema } from '@/auth/schemas/otp.schema';
import { IMailModuleType } from '@app/util';
import { InsertUserDto } from '@/accounts/users/dto/insert-user.dto';
import { SignupAdminDto } from './dto/signup-admin.dto';
import { VerifyUserEmailDto } from './dto/verify-user-email.dto';
import { SendVerifyOtpDto } from './dto/send-verify-otp.dto';
import { SetAvatarDto } from './dto/set-avatar.dto';
import { AccountType, ADMIN_LEVEL_ENUM } from '@repo/types';
import { UsersService } from '@/accounts/users/users.service';
import { PostgresTestContainer } from '@test/helpers/pg-test-container';
import { BrevoModule } from '@app/brevo';

const TEST_JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

const mailMock = {
  sendotp: jest.fn().mockResolvedValue(undefined),
  sendmail: jest.fn().mockResolvedValue(undefined),
};

describe('SignupController (integration)', () => {
  const pg = new PostgresTestContainer();
  let app: TestingModule;
  let controller: SignupController;
  let dataSource: DataSource;

  beforeAll(async () => {
    await pg.start();

    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          pg.getTypeOrmOptions({
            entities: [UserSchema, AdminSchema, OtpSchema],
          }),
        ),
        JwtModule.register({
          global: true,
          secret: TEST_JWT_SECRET,
          signOptions: { expiresIn: 86400 },
        }),
        BrevoModule.register({
          apiKy: 'test-key',
          email: 'test@example.com',
          ename: 'Test',
        }),
        SignupModule,
      ],
    })
      .overrideProvider(IMailModuleType)
      .useValue(mailMock)
      .compile();

    controller = app.get(SignupController);
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
    const adminRepo = dataSource.getRepository(AdminSchema);
    const userRepo = dataSource.getRepository(UserSchema);
    await otpRepo.deleteAll();
    await adminRepo.deleteAll();
    await userRepo.deleteAll();
  });

  const baseUser = {
    firstname: 'Signup',
    surname: 'Test',
    email: 'signup@example.com',
    username: 'signupuser',
    timezone: 'UTC',
    type: AccountType.Client,
  };

  describe('signup_user', () => {
    it('creates user and returns it', async () => {
      const body: InsertUserDto = { ...baseUser } as InsertUserDto;

      const result = await controller.signup_user(body);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.email).toBe(body.email);
      expect(result.username).toBe(body.username);
      expect(result.type).toBe(AccountType.Client);
    });

    it('propagates error when email already registered', async () => {
      await controller.signup_user({ ...baseUser } as InsertUserDto);
      await expect(
        controller.signup_user({
          ...baseUser,
          username: 'otheruser',
        } as InsertUserDto),
      ).rejects.toThrow();
    });
  });

  describe('signup_admin', () => {
    it('creates user and admin and returns admin', async () => {
      const body: SignupAdminDto = {
        ...baseUser,
        email: 'admin-signup@example.com',
        username: 'adminsignup',
        level: ADMIN_LEVEL_ENUM.MASTER,
      } as SignupAdminDto;

      const result = await controller.signup_admin(body);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.level).toBe(ADMIN_LEVEL_ENUM.MASTER);
      expect(result.User).toBeDefined();
      expect(result.User.email).toBe(body.email);
    });

    it('propagates validation error for invalid body', async () => {
      await expect(
        controller.signup_admin({
          ...baseUser,
          level: 'INVALID' as any,
        } as SignupAdminDto),
      ).rejects.toThrow();
    });
  });

  describe('send_verify_otp', () => {
    it('sends OTP when user exists and email not verified', async () => {
      await controller.signup_user({ ...baseUser } as InsertUserDto);

      const result = await controller.send_verify_otp({
        email: baseUser.email,
      } as SendVerifyOtpDto);

      expect(result).toBe(true);
      expect(mailMock.sendotp).toHaveBeenCalled();
    });

    it('throws when email already verified', async () => {
      const user = await controller.signup_user({
        ...baseUser,
      } as InsertUserDto);
      const usersService = app.get(UsersService);
      await usersService.update_user(user.id, { is_email_verified: true });

      await expect(
        controller.send_verify_otp({
          email: baseUser.email,
        } as SendVerifyOtpDto),
      ).rejects.toThrow('email already verified');
    });
  });

  describe('verify_user_email', () => {
    it('verifies email and returns sign-in result', async () => {
      await controller.signup_user({ ...baseUser } as InsertUserDto);
      await controller.send_verify_otp({ email: baseUser.email } as SendVerifyOtpDto);
      const otp = (mailMock.sendotp as jest.Mock).mock.calls[0][0];
      const result = await controller.verify_user_email({
        email: baseUser.email,
        otp,
      } as VerifyUserEmailDto);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refresh');
      expect(result.user.email).toBe(baseUser.email);
    });

    it('throws for wrong OTP', async () => {
      await controller.signup_user({ ...baseUser } as InsertUserDto);
      await controller.send_verify_otp({
        email: baseUser.email,
      } as SendVerifyOtpDto);

      await expect(
        controller.verify_user_email({
          email: baseUser.email,
          otp: '000000',
        } as VerifyUserEmailDto),
      ).rejects.toThrow();
    });
  });

  describe('verify_user_email_safe', () => {
    it('verifies email and returns user without signing in', async () => {
      await controller.signup_user({
        ...baseUser,
        email: 'safe@example.com',
        username: 'safeuser',
      } as InsertUserDto);
      await controller.send_verify_otp({
        email: 'safe@example.com',
      } as SendVerifyOtpDto);
      const otp = (mailMock.sendotp as jest.Mock).mock.calls[0][0];

      const result = await controller.verify_user_email_safe({
        email: 'safe@example.com',
        otp,
      } as VerifyUserEmailDto);

      expect(result.is_email_verified).toBe(true);
      expect(result.email).toBe('safe@example.com');
      expect(result).not.toHaveProperty('token');
    });
  });

  describe('set_user_avatar', () => {
    it('updates user avatar and returns user', async () => {
      const user = await controller.signup_user({
        ...baseUser,
      } as InsertUserDto);
      const body: SetAvatarDto = {
        user_id: user.id,
        value: 'https://example.com/avatar.png',
      };

      const result = await controller.set_user_avatar(body);

      expect(result.avatar).toBe(body.value);
      expect(result.id).toBe(user.id);
    });
  });
});
