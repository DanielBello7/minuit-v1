/**
 * Integration tests for SignupService using Postgres test container.
 * Mail mocked; tests signup_users, signup_admin, set_avatar.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { SignupService } from './signup.service';
import { SignupModule } from './signup.module';
import { UserSchema } from '@/accounts/users/schemas/user.schema';
import { AdminSchema } from '@/accounts/admins/schemas/admin.schema';
import { OtpSchema } from '@/auth/schemas/otp.schema';
import { IMailModuleType } from '@app/util';
import { InsertUserDto } from '@/accounts/users/dto/insert-user.dto';
import { SignupAdminDto } from './dto/signup-admin.dto';
import { SetAvatarDto } from './dto/set-avatar.dto';
import { AccountType, ADMIN_LEVEL_ENUM } from '@repo/types';
import { PostgresTestContainer } from '@test/helpers/pg-test-container';
import { BrevoModule } from '@app/brevo';

const TEST_JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

const mailMock = {
  sendotp: jest.fn().mockResolvedValue(undefined),
  sendmail: jest.fn().mockResolvedValue(undefined),
};

describe('SignupService (integration)', () => {
  const pg = new PostgresTestContainer();
  const baseUser = {
    firstname: 'Signup',
    surname: 'Test',
    email: 'signup@example.com',
    username: 'signupuser',
    timezone: 'UTC',
    type: AccountType.Client,
  };

  let app: TestingModule;
  let service: SignupService;
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

    service = app.get(SignupService);
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

  describe('signup_users', () => {
    it('creates user and returns it', async () => {
      const body: InsertUserDto = { ...baseUser } as InsertUserDto;
      const result = await service.signup_users(body);
      expect(result.id).toBeDefined();
      expect(result.email).toBe(body.email);
      expect(result.type).toBe(AccountType.Client);
    });
  });

  describe('signup_admin', () => {
    it('creates user and admin in transaction', async () => {
      const body: SignupAdminDto = {
        ...baseUser,
        email: 'admin-svc@example.com',
        username: 'adminsvc',
        level: ADMIN_LEVEL_ENUM.MASTER,
      } as SignupAdminDto;
      const result = await service.signup_admin(body);
      expect(result.id).toBeDefined();
      expect(result.level).toBe(ADMIN_LEVEL_ENUM.MASTER);
      expect(result.User).toBeDefined();
    });
  });

  describe('set_avatar', () => {
    it('updates user avatar', async () => {
      const user = await service.signup_users({
        ...baseUser,
      } as InsertUserDto);
      const body: SetAvatarDto = {
        user_id: user.id,
        value: 'https://example.com/av.png',
      };
      const result = await service.set_avatar(body);
      expect(result.avatar).toBe(body.value);
    });
  });
});
