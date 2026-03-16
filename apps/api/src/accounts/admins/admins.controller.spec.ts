/**
 * Integration tests for AdminsController using Postgres test container.
 * Real AdminsService, UsersService and controller; controller methods called directly.
 */
import * as bcrypt from 'bcryptjs';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminsController } from './admins.controller';
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

describe('AdminsController (integration)', () => {
  const pg = new PostgresTestContainer();
  const baseCreateUserDto: CreateUserDto = {
    firstname: 'Admin',
    surname: 'User',
    email: 'admin@example.com',
    username: 'adminuser',
    timezone: 'UTC',
    display_name: 'Admin User',
    type: AccountType.Admins,
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
  let controller: AdminsController;
  let adminsService: AdminsService;
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

    controller = app.get(AdminsController);
    adminsService = app.get(AdminsService);
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

  async function createAdmin(): Promise<{
    adminId: string;
    userId: string;
  }> {
    const hashed = bcrypt.hashSync('adminpass', CONSTANTS.HASH ?? 10);
    const user = await usersService.create_user({
      ...baseCreateUserDto,
      password: hashed,
      has_password: true,
      type: AccountType.Client,
    });
    const admin = await adminsService.insert_admin(
      { user_id: user.id, level: ADMIN_LEVEL_ENUM.MASTER },
      undefined,
    );
    return { adminId: admin.id, userId: user.id };
  }

  describe('findOne', () => {
    it('returns admin when id exists', async () => {
      const { adminId, userId } = await createAdmin();

      const result = await controller.find_by_id(adminId);

      expect(result).toBeDefined();
      expect(result.id).toBe(adminId);
      expect(result.user_id).toBe(userId);
      expect(result.level).toBe(ADMIN_LEVEL_ENUM.MASTER);
      expect(result.User).toBeDefined();
    });

    it('propagates errors for invalid id', async () => {
      await expect(
        controller.find_by_id('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow();
    });
  });
});
