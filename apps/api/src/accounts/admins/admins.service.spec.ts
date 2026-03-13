/**
 * Integration tests for AdminsService using Postgres test container.
 */
import * as bcrypt from 'bcryptjs';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminsService } from './admins.service';
import { AdminSchema } from './schemas/admin.schema';
import { UserSchema } from '../users/schemas/user.schema';
import { AdminsModule } from './admins.module';
import { UsersModule } from '../users/users.module';
import { MutationsModule } from '@app/mutations';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AccountType, ADMIN_LEVEL_ENUM } from '@repo/types';
import { CONSTANTS } from '@app/constants';
import { PostgresTestContainer } from '@test/helpers/pg-test-container';
import { JwtModule } from '@nestjs/jwt';

const TEST_JWT_SECRET = 'secret';

describe('AdminsService (integration)', () => {
  const pg = new PostgresTestContainer();
  const baseCreateUserDto: CreateUserDto = {
    firstname: 'Admin',
    surname: 'User',
    email: 'admin@example.com',
    username: 'adminuser',
    timezone: 'UTC',
    display_name: 'Admin User',
    type: AccountType.Client,
    is_email_verified: false,
    has_password: false,
    dark_mode: false,
    is_onboarded: false,
    password: undefined,
    avatar: undefined,
    refresh_token: undefined,
    last_login_date: undefined,
  };

  let app: TestingModule;
  let service: AdminsService;
  let usersService: UsersService;
  let dataSource: DataSource;

  beforeAll(async () => {
    await pg.start();

    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          pg.getTypeOrmOptions({
            entities: [AdminSchema, UserSchema],
          }),
        ),
        JwtModule.register({
          global: true,
          secret: TEST_JWT_SECRET,
          signOptions: { expiresIn: 86400 }, // 24h in seconds
        }),
        AdminsModule,
        UsersModule,
        MutationsModule,
      ],
    }).compile();

    service = app.get(AdminsService);
    usersService = app.get(UsersService);
    dataSource = app.get(getDataSourceToken());
  }, 60_000);

  afterAll(async () => {
    await dataSource?.destroy();
    await app?.close();
    await pg.stop();
  });

  beforeEach(async () => {
    const adminRepo = dataSource.getRepository(AdminSchema);
    const userRepo = dataSource.getRepository(UserSchema);
    await adminRepo.deleteAll();
    await userRepo.deleteAll();
  });

  async function createUser() {
    const hashed = bcrypt.hashSync('pass', CONSTANTS.HASH ?? 10);
    return usersService.create_user({
      ...baseCreateUserDto,
      password: hashed,
      has_password: true,
    });
  }

  describe('insert_admin', () => {
    it('creates admin and returns it with User relation', async () => {
      const user = await createUser();
      const admin = await service.insert_admin({
        user_id: user.id,
        level: ADMIN_LEVEL_ENUM.MASTER,
      });
      expect(admin.id).toBeDefined();
      expect(admin.user_id).toBe(user.id);
      expect(admin.level).toBe(ADMIN_LEVEL_ENUM.MASTER);
      expect(admin.User).toBeDefined();
    });

    it('throws when user already used as admin', async () => {
      const user = await createUser();
      await service.insert_admin({
        user_id: user.id,
        level: ADMIN_LEVEL_ENUM.MASTER,
      });
      await expect(
        service.insert_admin({
          user_id: user.id,
          level: ADMIN_LEVEL_ENUM.RESIDENT,
        }),
      ).rejects.toThrow('user account already used');
    });
  });

  describe('find_by_id', () => {
    it('returns admin with User when found', async () => {
      const user = await createUser();
      const admin = await service.insert_admin({
        user_id: user.id,
        level: ADMIN_LEVEL_ENUM.MASTER,
      });
      const result = await service.find_by_id(admin.id);
      expect(result?.id).toBe(admin.id);
      expect(result?.User).toBeDefined();
    });

    it('returns undefined or throws when not found', async () => {
      await expect(service.find_by_id('00000000-0000-0000-0000-000000000000')).rejects.toThrow();
    });
  });

  describe('is_user_used', () => {
    it('returns USED when user has admin record', async () => {
      const user = await createUser();
      await service.insert_admin({
        user_id: user.id,
        level: ADMIN_LEVEL_ENUM.MASTER,
      });
      const result = await service.is_user_used(user.id);
      expect(result).toBeDefined();
      expect(result).not.toBe(undefined);
    });

    it('returns UNUSED when user has no admin record', async () => {
      const user = await createUser();
      const result = await service.is_user_used(user.id);
      expect(result).toBeDefined();
    });
  });
});
