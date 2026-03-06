/**
 * Integration tests for UsersController using Postgres test container.
 * Same DB setup as users service; real UsersService and controller.
 */
import * as bcrypt from 'bcryptjs';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserSchema } from './schemas/user.schema';
import { UsersModule } from './users.module';
import { MutationsModule } from '@app/mutations';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { AccountType } from '@repo/types';
import { CONSTANTS } from '@app/constants';
import { PostgresTestContainer } from '@test/helpers/pg-test-container';

describe('UsersController (integration)', () => {
  const pg = new PostgresTestContainer();
  const baseCreateUserDto: CreateUserDto = {
    firstname: 'Test',
    surname: 'User',
    email: 'test@example.com',
    username: 'testuser',
    timezone: 'UTC',
    display_name: 'Test User',
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
  let controller: UsersController;
  let usersService: UsersService;
  let dataSource: DataSource;

  beforeAll(async () => {
    await pg.start();

    app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          pg.getTypeOrmOptions({
            entities: [UserSchema],
          }),
        ),
        UsersModule,
        MutationsModule,
      ],
    }).compile();

    controller = app.get(UsersController);
    usersService = app.get(UsersService);
    dataSource = app.get(getDataSourceToken());
  }, 60_000);

  afterAll(async () => {
    await dataSource?.destroy();
    await app?.close();
    await pg.stop();
  });

  beforeEach(async () => {
    const repo = dataSource.getRepository(UserSchema);
    await repo.clear();
  });

  async function createUser(
    overrides: Partial<CreateUserDto> & { password?: string } = {},
  ): Promise<{ id: string; email: string; password?: string }> {
    const plainPassword = overrides.password;
    const hashed = plainPassword ? bcrypt.hashSync(plainPassword, CONSTANTS.HASH ?? 10) : undefined;
    const dto: CreateUserDto = {
      ...baseCreateUserDto,
      ...overrides,
      password: hashed,
      has_password: !!plainPassword,
    };
    const user = await usersService.create_user(dto);
    return { id: user.id, email: user.email, password: plainPassword };
  }

  describe('update_user', () => {
    it('updates user by id and returns modified user', async () => {
      const { id } = await createUser();
      const body: UpdateUserDto = { firstname: 'Jane', surname: 'Smith' };

      const result = await controller.update_user(id, body);

      expect(result.firstname).toBe('Jane');
      expect(result.surname).toBe('Smith');
      expect(result.display_name).toBe('Jane Smith');
    });

    it('propagates errors for invalid id', async () => {
      await expect(
        controller.update_user('00000000-0000-0000-0000-000000000000', {
          firstname: 'X',
        }),
      ).rejects.toThrow();
    });
  });

  describe('search_users', () => {
    it('returns paginated list matching email query', async () => {
      await createUser({ email: 'alice@example.com' });
      await createUser({ email: 'alice2@example.com' });
      const query = { value: 'alice' };

      const result = await controller.search_users(query);

      expect(result.docs.length).toBeGreaterThanOrEqual(2);
      expect(result.total_docs).toBeGreaterThanOrEqual(2);
      expect(result.page).toBe(1);
      expect(result).toHaveProperty('has_next_page');
      expect(result).toHaveProperty('total_pages');
    });
  });

  describe('get_user_by_email', () => {
    it('returns user when email exists', async () => {
      const { email } = await createUser({ email: 'find@example.com' });

      const result = await controller.get_user_by_email(email);

      expect(result.email).toBe(email);
    });

    it('throws when email not registered', async () => {
      await expect(controller.get_user_by_email('nobody@example.com')).rejects.toThrow();
    });
  });

  describe('get_user_by_id', () => {
    it('returns user when id exists', async () => {
      const { id, email } = await createUser();

      const result = await controller.get_user_by_id(id);

      expect(result.id).toBe(id);
      expect(result.email).toBe(email);
    });

    it('throws when id does not exist', async () => {
      await expect(
        controller.get_user_by_id('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow();
    });
  });

  describe('get_user_status', () => {
    it('returns is_onboarded for user', async () => {
      const { id } = await createUser();

      const result = await controller.get_user_status(id);

      expect(result).toEqual({ is_onboarded: false });
    });
  });

  describe('set_password', () => {
    it('sets password for user without password', async () => {
      const { id } = await createUser();
      const body: SetPasswordDto = { id, new_password: 'secret123' };

      const result = await controller.set_password(body);

      expect(result.has_password).toBe(true);
      const user = await usersService.find_user_by_id(id);
      expect(bcrypt.compareSync('secret123', user.password!)).toBe(true);
    });

    it('throws when user already has password', async () => {
      const { id } = await createUser({ password: 'existing' });
      await expect(controller.set_password({ id, new_password: 'newpass' })).rejects.toThrow();
    });
  });

  describe('update_password', () => {
    it('updates password when old password matches', async () => {
      const { id } = await createUser({ password: 'oldpass' });
      const body: UpdatePasswordDto = {
        old_password: 'oldpass',
        new_password: 'newpass',
      };

      const result = await controller.update_password(body, id);

      expect(result.id).toBe(id);
      const user = await usersService.find_user_by_id(id);
      expect(bcrypt.compareSync('newpass', user.password!)).toBe(true);
    });

    it('throws when old password is wrong', async () => {
      const { id } = await createUser({ password: 'correct' });
      await expect(
        controller.update_password({ old_password: 'wrong', new_password: 'new' }, id),
      ).rejects.toThrow();
    });
  });
});
