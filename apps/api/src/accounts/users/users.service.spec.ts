/**
 * Integration tests for UsersService using Postgres test container.
 * No mocks: real DB and MutationsService.
 */
import * as bcrypt from 'bcryptjs';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UserSchema } from './schemas/user.schema';
import { UsersModule } from './users.module';
import { MutationsModule } from '@app/mutations';
import { CreateUserDto } from './dto/create-user.dto';
import { InsertUserDto } from './dto/insert-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { SearchDto } from './dto/search.dto';
import { AccountType } from '@repo/types';
import { CONSTANTS } from '@app/constants';
import { PostgresTestContainer } from '@test/helpers/pg-test-container';

describe('UsersService (integration)', () => {
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
  let service: UsersService;
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

    service = app.get(UsersService);
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
    const user = await service.create_user(dto);
    return { id: user.id, email: user.email, password: plainPassword };
  }

  describe('db connection', () => {
    it('connects to the database', async () => {
      const list = await dataSource.getRepository(UserSchema).find();
      expect(list.length).toBeLessThan(10);
    });
  });

  describe('create_user', () => {
    it('creates a user and returns it', async () => {
      const user = await service.create_user(baseCreateUserDto);
      expect(user.id).toBeDefined();
      expect(user.email).toBe(baseCreateUserDto.email);
      expect(user.display_name).toBe('Test User');
      expect(user.username).toBe(baseCreateUserDto.username);
    });

    it('throws BadRequestException for invalid DTO', async () => {
      await expect(
        service.create_user({ ...baseCreateUserDto, email: 'not-an-email' } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('insert_other_user', () => {
    const insertDto: InsertUserDto = {
      email: 'new@example.com',
      firstname: 'Jane',
      surname: 'Doe',
      username: 'janedoe',
      timezone: 'UTC',
      type: AccountType.Client,
      password: undefined,
    };

    it('creates a user with default fields', async () => {
      const user = await service.insert_other_user(insertDto);
      expect(user.email).toBe(insertDto.email);
      expect(user.display_name).toBe('Jane Doe');
      expect(user.is_email_verified).toBe(false);
      expect(user.has_password).toBe(false);
    });

    it('throws when type is Admins', async () => {
      await expect(
        service.insert_other_user({ ...insertDto, type: AccountType.Admins }),
      ).rejects.toThrow('type cannot be admin');
    });

    it('throws when email already registered', async () => {
      await service.insert_other_user(insertDto);
      await expect(service.insert_other_user(insertDto)).rejects.toThrow(
        'email already registered',
      );
    });

    it('throws when username already registered', async () => {
      await service.insert_other_user(insertDto);
      await expect(
        service.insert_other_user({
          ...insertDto,
          email: 'other@example.com',
          username: insertDto.username,
        }),
      ).rejects.toThrow('username already registered');
    });
  });

  describe('insert_admin', () => {
    it('creates a user with type Admins', async () => {
      const user = await service.insert_admin({
        email: 'admin@example.com',
        firstname: 'Admin',
        surname: 'User',
        username: 'adminuser',
        timezone: 'UTC',
      } as any);
      expect(user.type).toBe(AccountType.Admins);
    });
  });

  describe('find_user_by_id', () => {
    it('returns user when id exists', async () => {
      const { id } = await createUser();
      const user = await service.find_user_by_id(id);
      expect(user.id).toBe(id);
      expect(user.email).toBe(baseCreateUserDto.email);
    });

    it('throws NotFoundException when id does not exist', async () => {
      await expect(
        service.find_user_by_id('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow();
    });
  });

  describe('find_user_by_email', () => {
    it('returns user when email exists', async () => {
      const { email } = await createUser({ email: 'find@example.com' });
      const user = await service.find_user_by_email(email);
      expect(user.email).toBe(email);
    });

    it('throws NotFoundException when email not registered', async () => {
      await expect(service.find_user_by_email('nobody@example.com')).rejects.toThrow(
        'email not registered',
      );
    });
  });

  describe('get_status_by_id', () => {
    it('returns is_onboarded', async () => {
      const { id } = await createUser();
      const status = await service.get_status_by_id(id);
      expect(status).toEqual({ is_onboarded: false });
    });
  });

  describe('modify_user_by_id', () => {
    it('updates user and computes display_name', async () => {
      const { id } = await createUser();
      const body: UpdateUserDto = { firstname: 'Jane', surname: 'Smith' };
      const updated = await service.modify_user_by_id(id, body);
      expect(updated.firstname).toBe('Jane');
      expect(updated.surname).toBe('Smith');
      expect(updated.display_name).toBe('Jane Smith');
    });
  });

  describe('update_user', () => {
    it('updates by id', async () => {
      const { id } = await createUser();
      const updated = await service.update_user(id, { firstname: 'Updated' });
      expect(updated.firstname).toBe('Updated');
    });
  });

  describe('delete_user', () => {
    it('soft-deletes user', async () => {
      const { id } = await createUser();
      const removed = await service.delete_user(id);
      expect(removed.id).toBe(id);
      await expect(service.find_user_by_id(id)).rejects.toThrow();
    });
  });

  describe('set_password', () => {
    it('sets password for user without password', async () => {
      const { id } = await createUser();
      const body: SetPasswordDto = { id, new_password: 'secret123' };
      const updated = await service.set_password(body);
      expect(updated.has_password).toBe(true);
      const user = await service.find_user_by_id(id);
      expect(bcrypt.compareSync('secret123', user.password!)).toBe(true);
    });

    it('throws when user already has password', async () => {
      const { id } = await createUser({ password: 'existing' });
      await expect(service.set_password({ id, new_password: 'newpass' })).rejects.toThrow(
        'user already has its password set',
      );
    });
  });

  describe('update_password', () => {
    it('updates password when old password matches', async () => {
      const { id } = await createUser({ password: 'oldpass' });
      const updated = await service.update_password(id, {
        old_password: 'oldpass',
        new_password: 'newpass',
      });
      expect(updated.id).toBe(id);
      const user = await service.find_user_by_id(id);
      expect(bcrypt.compareSync('newpass', user.password!)).toBe(true);
    });

    it('throws when user has no password', async () => {
      const { id } = await createUser();
      await expect(
        service.update_password(id, {
          old_password: 'any',
          new_password: 'new',
        }),
      ).rejects.toThrow("user doesn't have a password set");
    });

    it('throws when old password is wrong', async () => {
      const { id } = await createUser({ password: 'correct' });
      await expect(
        service.update_password(id, {
          old_password: 'wrong',
          new_password: 'new',
        }),
      ).rejects.toThrow('invalid credentials');
    });
  });

  describe('search_by_email', () => {
    it('returns paginated users matching email', async () => {
      await createUser({ email: 'alice@example.com' });
      await createUser({ email: 'alice2@example.com' });
      await createUser({ email: 'bob@example.com' });
      const result = await service.search_by_email({ value: 'alice' } as SearchDto);
      expect(result.docs.length).toBeGreaterThanOrEqual(2);
      expect(result.total_docs).toBeGreaterThanOrEqual(2);
      expect(result.page).toBe(1);
      expect(result).toHaveProperty('has_next_page');
      expect(result).toHaveProperty('total_pages');
    });

    it('throws when value is empty (invalid DTO)', async () => {
      await expect(service.search_by_email({ value: '' } as SearchDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws when pagination limit exceeded', async () => {
      await expect(
        service.search_by_email({
          value: 'a',
          pagination: { page: 100_001, pick: 10 },
        } as any),
      ).rejects.toThrow('pagination limit exceeded');
    });
  });

  describe('find_by_ids', () => {
    it('returns users by ids', async () => {
      const { id: id1 } = await createUser({ email: 'u1@example.com' });
      const { id: id2 } = await createUser({ email: 'u2@example.com' });
      const list = await service.find_by_ids([id1, id2]);
      expect(list).toHaveLength(2);
      expect(list.map((u) => u.id).sort()).toEqual([id1, id2].sort());
    });
  });
});
