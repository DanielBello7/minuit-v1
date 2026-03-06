import * as bcrypt from 'bcryptjs';
import * as datefns from 'date-fns';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthModule } from './auth.module';
import { UserSchema } from '@/accounts/users/schemas/user.schema';
import { OtpSchema } from './schemas/otp.schema';
import { UsersService } from '@/accounts/users/users.service';
import { IMailModuleType } from '@app/util';
import { AccountType, OTP_PURPOSE_ENUM } from '@repo/types';
import { CreateUserDto } from '@/accounts/users/dto/create-user.dto';
import { SigninDto } from './dto/signin.dto';
import { SigninEmailDto } from './dto/signin-email.dto';
import { SigninOtpDto } from './dto/signin-otp.dto';
import { EmailDto } from './dto/email.dto';
import { RecoverDto } from './dto/recover.dto';
import { ValidateVerifyOtpDto } from './dto/validate-verify-otp.dto';
import { CONSTANTS } from '@app/constants';
import { MutationsModule } from '@app/mutations';
import { UsersModule } from '@/accounts/users/users.module';
import { PostgresTestContainer } from '@test/helpers/pg-test-container';
import { BrevoModule } from '@app/brevo';

const TEST_JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

describe('AuthService (integration)', () => {
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

  let usersService: UsersService;
  let app: TestingModule;
  let authService: AuthService;
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

  describe('db connection', () => {
    it('should be able to connect to db', async () => {
      const response = await dataSource.getRepository(UserSchema).find();
      expect(response.length).toBeLessThan(10);
    });
  });

  describe('validate', () => {
    it('returns ValidUser for correct password', async () => {
      const { email, password } = await createUserWithPassword();

      const result = await authService.validate({
        username: email,
        password,
      } as SigninDto);

      expect(result).toMatchObject({
        email,
        name: 'Test User',
        type: AccountType.Client,
      });
      expect(result?.id).toBeDefined();
    });

    it('returns null for wrong password', async () => {
      await createUserWithPassword();

      const result = await authService.validate({
        username: 'test@example.com',
        password: 'wrongpassword',
      } as SigninDto);

      expect(result).toBeNull();
    });

    it('returns ValidUser for user without password (no check)', async () => {
      const { email } = await createUserWithoutPassword();

      const result = await authService.validate({
        username: email,
        password: 'anything',
      } as SigninDto);

      expect(result).toMatchObject({ email, name: 'Test User' });
    });
  });

  describe('authenticate', () => {
    it('returns SigninResponse for valid credentials', async () => {
      const { email, password } = await createUserWithPassword();

      const result = await authService.authenticate({
        username: email,
        password,
      } as SigninDto);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refresh');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(email);
      expect(result.user.display_name).toBe('Test User');
    });

    it('throws UnauthorizedException for invalid credentials', async () => {
      await createUserWithPassword();

      await expect(
        authService.authenticate({
          username: 'test@example.com',
          password: 'wrong',
        } as SigninDto),
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('sign_in_validated_account', () => {
    it('returns tokens and user and persists refresh_token', async () => {
      const { id, email } = await createUserWithPassword();
      const validUser = { id, email, name: 'Test User', type: AccountType.Client };

      const result = await authService.sign_in_validated_account(validUser);

      expect(result.token).toBeDefined();
      expect(result.refresh).toBeDefined();
      expect(result.user.id).toBe(id);
      expect(result.user.email).toBe(email);

      const userAfter = await usersService.find_user_by_id(id);
      expect(userAfter.refresh_token).toBe(result.refresh);
      expect(userAfter.last_login_date).toBeDefined();
    });
  });

  describe('whoami', () => {
    it('returns user by id', async () => {
      const { id, email } = await createUserWithPassword();

      const result = await authService.whoami(id);

      expect(result.id).toBe(id);
      expect(result.email).toBe(email);
      expect(result.display_name).toBe('Test User');
    });
  });

  describe('sign_out', () => {
    it('clears refresh_token for user', async () => {
      const { id, email, password } = await createUserWithPassword();
      const signIn = await authService.authenticate({
        username: email,
        password,
      } as SigninDto);
      expect(signIn.user.id).toBe(id);

      const result = await authService.sign_out(id);

      expect(result.id).toBe(id);
      const userAfter = await usersService.find_user_by_id(id);
      expect(userAfter.refresh_token).toBeNull();
    });
  });

  describe('confirm_auth', () => {
    it('returns ValidUser for valid JWT', async () => {
      const { id, email, password } = await createUserWithPassword();
      const signIn = await authService.authenticate({
        username: email,
        password,
      } as SigninDto);

      const payload = await authService.confirm_auth(signIn.token);

      expect(payload).toMatchObject({ id, email, name: 'Test User' });
    });

    it('returns null for invalid JWT', async () => {
      const result = await authService.confirm_auth('invalid.jwt.token');
      expect(result).toBeNull();
    });
  });

  describe('generate_refresh', () => {
    it('returns new tokens when refresh matches stored', async () => {
      const { id, email, password } = await createUserWithPassword();
      const signIn = await authService.authenticate({
        username: email,
        password,
      } as SigninDto);

      const result = await authService.generate_refresh(email, signIn.refresh);

      expect(result.token).toBeDefined();
      expect(result.refresh).toBeDefined();
      expect(result.user.id).toBe(id);
    });

    it('throws NotFoundException when user has no refresh token', async () => {
      const { email } = await createUserWithPassword();
      await authService.sign_out((await usersService.find_user_by_email(email)).id);

      await expect(authService.generate_refresh(email, 'some-refresh')).rejects.toThrow(
        'cannot find refresh',
      );
    });

    it('throws when refresh does not match', async () => {
      const { email } = await createUserWithPassword();

      await expect(authService.generate_refresh(email, 'wrong-refresh-token')).rejects.toThrow(
        'cannot find refresh',
      );
    });
  });

  describe('signin_email_verify', () => {
    it('returns PASSWORD type when user has password', async () => {
      await createUserWithPassword({ email: 'pwd@example.com' });

      const result = await authService.signin_email_verify({
        email: 'pwd@example.com',
      } as SigninEmailDto);

      expect(result).toEqual({
        type: 'PASSWORD',
        display_name: 'Test User',
      });
    });

    it('returns OTP type and sends OTP when user has no password', async () => {
      await createUserWithoutPassword({ email: 'otp@example.com' });

      const result = await authService.signin_email_verify({
        email: 'otp@example.com',
      } as SigninEmailDto);

      expect(result.type).toBe('OTP');
      expect(result.display_name).toBe('Test User');
      expect(mailMock.sendotp).toHaveBeenCalledWith(
        expect.stringMatching(/^\d{6}$/),
        'otp@example.com',
        'Test User',
      );
    });
  });

  describe('signin_email_otp', () => {
    it('signs in with valid OTP and returns tokens', async () => {
      await createUserWithoutPassword({ email: 'otpuser@example.com' });
      await authService.signin_email_verify({
        email: 'otpuser@example.com',
      } as SigninEmailDto);
      const sentOtp = (mailMock.sendotp as jest.Mock).mock.calls[0][0];

      const result = await authService.signin_email_otp({
        email: 'otpuser@example.com',
        otp: sentOtp,
      } as SigninOtpDto);

      expect(result.token).toBeDefined();
      expect(result.refresh).toBeDefined();
      expect(result.user.email).toBe('otpuser@example.com');
    });

    it('throws BadRequestException for wrong OTP', async () => {
      await createUserWithoutPassword({ email: 'otp2@example.com' });
      await authService.signin_email_verify({ email: 'otp2@example.com' } as SigninEmailDto);

      await expect(
        authService.signin_email_otp({
          email: 'otp2@example.com',
          otp: '000000',
        } as SigninOtpDto),
      ).rejects.toThrow(); // BadRequest or NotFound (OTP not found) - MutationsService rewraps as HttpException
    });
  });

  describe('recovery_verify', () => {
    it('sends recovery OTP and returns true', async () => {
      await createUserWithPassword({ email: 'recover@example.com' });

      const result = await authService.recovery_verify({
        email: 'recover@example.com',
      } as EmailDto);

      expect(result).toBe(true);
      expect(mailMock.sendotp).toHaveBeenCalledWith(
        expect.stringMatching(/^\d{6}$/),
        'recover@example.com',
        'Test User',
      );
    });

    it('throws BadRequestException when user has no password', async () => {
      await createUserWithoutPassword({ email: 'nopwd@example.com' });

      await expect(
        authService.recovery_verify({ email: 'nopwd@example.com' } as EmailDto),
      ).rejects.toThrow('error recovering user password');
    });
  });

  describe('validate_verify_otp', () => {
    it('returns true for valid recovery OTP', async () => {
      await createUserWithPassword({ email: 'v@example.com' });
      await authService.recovery_verify({ email: 'v@example.com' } as EmailDto);
      const otp = (mailMock.sendotp as jest.Mock).mock.calls[0][0];

      const result = await authService.validate_verify_otp({
        email: 'v@example.com',
        otp,
      } as ValidateVerifyOtpDto);

      expect(result).toBe(true);
    });

    it('throws BadRequestException when user has no password', async () => {
      await createUserWithoutPassword({ email: 'vnopwd@example.com' });
      const otpEntity = await authService.insert_otp({
        email: 'vnopwd@example.com',
        purpose: OTP_PURPOSE_ENUM.RECOVERY,
      });

      await expect(
        authService.validate_verify_otp({
          email: 'vnopwd@example.com',
          otp: otpEntity.value,
        } as ValidateVerifyOtpDto),
      ).rejects.toThrow('invalid credentials');
    });
  });

  describe('recover', () => {
    it('updates password when OTP is valid and new password differs', async () => {
      await createUserWithPassword({
        email: 'recoverfinal@example.com',
        password: 'oldpass123',
      });
      await authService.recovery_verify({
        email: 'recoverfinal@example.com',
      } as EmailDto);
      const otp = (mailMock.sendotp as jest.Mock).mock.calls[0][0];

      const result = await authService.recover({
        email: 'recoverfinal@example.com',
        otp,
        password: 'newpass456',
      } as RecoverDto);

      expect(result.id).toBeDefined();
      const userAfter = await usersService.find_user_by_email('recoverfinal@example.com');
      expect(bcrypt.compareSync('newpass456', userAfter.password!)).toBe(true);
    });

    it('throws BadRequestException when new password same as old', async () => {
      await createUserWithPassword({
        email: 'same@example.com',
        password: 'samepass',
      });
      await authService.recovery_verify({ email: 'same@example.com' } as EmailDto);
      const otp = (mailMock.sendotp as jest.Mock).mock.calls[0][0];

      await expect(
        authService.recover({
          email: 'same@example.com',
          otp,
          password: 'samepass',
        } as RecoverDto),
      ).rejects.toThrow('new password cannot be the same as old password');
    });

    it('throws BadRequestException for expired OTP', async () => {
      await createUserWithPassword({ email: 'exp@example.com' });
      await authService.recovery_verify({ email: 'exp@example.com' } as EmailDto);
      const otp = (mailMock.sendotp as jest.Mock).mock.calls[0][0];

      const otpRepo = dataSource.getRepository(OtpSchema);
      const otpRow = await otpRepo.findOne({ where: { value: otp } });
      if (otpRow) {
        await otpRepo.update(otpRow.id, {
          expires_at: datefns.subHours(new Date(), 1),
        });
      }

      await expect(
        authService.recover({
          email: 'exp@example.com',
          otp,
          password: 'newpass',
        } as RecoverDto),
      ).rejects.toThrow('otp expired');
    });
  });
});
