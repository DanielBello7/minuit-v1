import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserSchema } from './schemas/user.schema';
import { MutationsService } from '@app/mutations';
import { InsertUserDto } from './dto/insert-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { EntityManager } from 'typeorm';
import { AccountType } from '@repo/types';
import { SetPasswordDto } from './dto/set-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { SearchDto } from './dto/search.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  compareSync: jest.fn(),
  hashSync: jest.fn((password: string) => `hashed_${password}`),
}));

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<Repository<UserSchema>>;
  let mutationsService: jest.Mocked<MutationsService>;
  let entityManager: jest.Mocked<EntityManager>;

  const mockUser: Partial<UserSchema> = {
    id: 'user-id-1',
    email: 'test@example.com',
    firstname: 'John',
    surname: 'Doe',
    username: 'johndoe',
    timezone: 'America/New_York',
    avatar: undefined,
    password: undefined,
    has_password: false,
    is_email_verified: false,
    display_name: 'John Doe',
    is_onboarded: false,
  };

  beforeEach(async () => {
    entityManager = {
      getRepository: jest.fn(),
    } as any;

    const mockUsersRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      softDelete: jest.fn(),
      createQueryBuilder: jest.fn(),
      target: UserSchema,
    };

    mutationsService = {
      execute: jest.fn(),
      getRepo: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserSchema),
          useValue: mockUsersRepo,
        },
        {
          provide: MutationsService,
          useValue: mutationsService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(getRepositoryToken(UserSchema));

    entityManager.getRepository = jest.fn(() => usersRepository) as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe.skip('is_already_registered', () => {
    it('should throw BadRequestException if email is already registered', async () => {
      const email = 'existing@example.com';
      const username = 'newuser';
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ ...mockUser, email }),
      };
      usersRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);

      await expect(service.is_already_registered(email, username, entityManager)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.is_already_registered(email, username, entityManager)).rejects.toThrow(
        'email already registered',
      );
    });

    it('should throw BadRequestException if username is already registered', async () => {
      const email = 'new@example.com';
      const username = 'johndoe';
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ ...mockUser, username }),
      };
      usersRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);

      await expect(service.is_already_registered(email, username, entityManager)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.is_already_registered(email, username, entityManager)).rejects.toThrow(
        'username already registered',
      );
    });

    it('should return void if email and username are not registered', async () => {
      const email = 'new@example.com';
      const username = 'newuser';
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      usersRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);

      const result = await service.is_already_registered(email, username, entityManager);
      expect(result).toBeUndefined();
    });
  });

  describe.skip('insert_other_user (insert_user)', () => {
    const insertUserDto: InsertUserDto = {
      email: 'newuser@example.com',
      firstname: 'Jane',
      surname: 'Smith',
      username: 'janesmith',
      timezone: 'America/Los_Angeles',
      password: undefined,
      type: AccountType.Client,
    };

    it('should create user successfully', async () => {
      const createdUser = {
        ...mockUser,
        ...insertUserDto,
        is_email_verified: false,
        display_name: 'Jane Smith',
      };

      usersRepository.create = jest.fn().mockReturnValue(createdUser);
      usersRepository.save = jest.fn().mockResolvedValue(createdUser);
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      usersRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      const result = await service.insert_other_user(insertUserDto);

      expect(mutationsService.execute).toHaveBeenCalled();
      expect(usersRepository.save).toHaveBeenCalled();
      expect(result).toMatchObject({
        email: insertUserDto.email,
        firstname: insertUserDto.firstname,
        surname: insertUserDto.surname,
        timezone: insertUserDto.timezone,
        is_email_verified: false,
      });
    });

    it('should throw BadRequestException if email is already registered', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ ...mockUser, email: insertUserDto.email }),
      };
      usersRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      await expect(service.insert_other_user(insertUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid DTO', async () => {
      const invalidDto = { email: 'invalid-email' } as InsertUserDto;

      await expect(service.insert_other_user(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should work with provided session', async () => {
      const createdUser = {
        ...mockUser,
        ...insertUserDto,
        is_email_verified: false,
        display_name: 'Jane Smith',
      };
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      usersRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);
      usersRepository.create = jest.fn().mockReturnValue(createdUser);
      usersRepository.save = jest.fn().mockResolvedValue(createdUser);

      const result = await service.insert_other_user(insertUserDto, entityManager);

      expect(mutationsService.execute).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe.skip('insert_admin', () => {
    const insertAdminDto = {
      email: 'admin@example.com',
      firstname: 'Admin',
      surname: 'User',
      username: 'adminuser',
      timezone: 'UTC',
      password: undefined,
    };

    it('should create admin user successfully', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      usersRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);
      const createdAdmin = {
        ...mockUser,
        ...insertAdminDto,
        type: 'Admins' as any,
        is_email_verified: false,
      };
      usersRepository.create = jest.fn().mockReturnValue(createdAdmin);
      usersRepository.save = jest.fn().mockResolvedValue(createdAdmin);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      const result = await service.insert_admin(insertAdminDto as any);

      expect(result.type).toBe('Admins');
    });
  });

  describe.skip('insert_other_user type guard', () => {
    const insertUserDto: InsertUserDto = {
      email: 'user@example.com',
      firstname: 'Regular',
      surname: 'User',
      username: 'regularuser',
      timezone: 'UTC',
      password: undefined,
      type: AccountType.Client,
    };

    it('should throw BadRequestException if type is Admins', async () => {
      const adminDto = {
        ...insertUserDto,
        type: AccountType.Admins,
      };

      await expect(service.insert_other_user(adminDto as any)).rejects.toThrow(BadRequestException);
      await expect(service.insert_other_user(adminDto as any)).rejects.toThrow(
        'type cannot be admin',
      );
    });
  });

  describe.skip('find_user_by_email', () => {
    it('should find user by email successfully', async () => {
      usersRepository.findOne = jest.fn().mockResolvedValue(mockUser);

      const result = await service.find_user_by_email('test@example.com');

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if email not found', async () => {
      usersRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.find_user_by_email('nonexistent@example.com')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.find_user_by_email('nonexistent@example.com')).rejects.toThrow(
        'email not registered',
      );
    });

    it('should work with provided session', async () => {
      const sessionRepo = {
        findOne: jest.fn().mockResolvedValue(mockUser),
      };
      entityManager.getRepository = jest.fn().mockReturnValue(sessionRepo);

      const result = await service.find_user_by_email('test@example.com', entityManager);

      expect(result).toEqual(mockUser);
      expect(sessionRepo.findOne).toHaveBeenCalled();
    });
  });

  describe.skip('find_user_by_id', () => {
    it('should find user by id successfully', async () => {
      usersRepository.findOne = jest.fn().mockResolvedValue(mockUser);

      const result = await service.find_user_by_id('user-id-1');

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      usersRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.find_user_by_id('non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(service.find_user_by_id('non-existent-id')).rejects.toThrow(
        'Cannot find entity with id',
      );
    });

    it('should work with provided session', async () => {
      const sessionRepo = {
        findOne: jest.fn().mockResolvedValue(mockUser),
      };
      entityManager.getRepository = jest.fn().mockReturnValue(sessionRepo);

      const result = await service.find_user_by_id('user-id-1', entityManager);

      expect(result).toEqual(mockUser);
      expect(sessionRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
      });
    });
  });

  describe.skip('get_status_by_id', () => {
    it('should return is_onboarded status', async () => {
      usersRepository.findOne = jest.fn().mockResolvedValue(mockUser);

      const result = await service.get_status_by_id('user-id-1');

      expect(result).toEqual({ is_onboarded: (mockUser as any).is_onboarded });
    });

    it('should throw NotFoundException when user not found', async () => {
      usersRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.get_status_by_id('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe.skip('modify_user_by_id', () => {
    it('should update user and return result', async () => {
      const body: UpdateUserDto = { firstname: 'Jane', surname: 'Smith' };
      const updatedUser = { ...mockUser, ...body };
      usersRepository.findOne = jest.fn().mockResolvedValue(mockUser);
      usersRepository.update = jest.fn().mockResolvedValue({ affected: 1 });
      usersRepository.findOne = jest
        .fn()
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(updatedUser);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      const updateSpy = jest.spyOn(service, 'update_user').mockResolvedValue(updatedUser as any);

      const result = await service.modify_user_by_id('user-id-1', body);

      expect(mutationsService.execute).toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalledWith(
        'user-id-1',
        expect.objectContaining({
          firstname: 'Jane',
          surname: 'Smith',
          display_name: 'Jane Smith',
        }),
        entityManager,
      );
      expect(result).toEqual(updatedUser);
      updateSpy.mockRestore();
    });
  });

  describe.skip('create_user', () => {
    const createUserDto: CreateUserDto = {
      email: 'user@example.com',
      firstname: 'Test',
      surname: 'User',
      timezone: 'UTC',
      avatar: undefined,
      last_login_date: undefined,
      refresh_token: undefined,
      password: undefined,
      username: 'hellothere',
      type: AccountType.Client,
      display_name: 'Test User',
      is_email_verified: false,
      has_password: false,
      dark_mode: false,
      is_onboarded: false,
    };

    it('should create user successfully', async () => {
      const createdUser = { ...mockUser, ...createUserDto };
      usersRepository.create = jest.fn().mockReturnValue(createdUser);
      usersRepository.save = jest.fn().mockResolvedValue(createdUser);

      const result = await service.create_user(createUserDto);

      expect(usersRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(usersRepository.save).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual(createdUser);
    });

    it('should throw BadRequestException for invalid DTO', async () => {
      const invalidDto = { email: 'invalid' } as CreateUserDto;

      await expect(service.create_user(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should work with provided session', async () => {
      const createdUser = { ...mockUser, ...createUserDto };
      usersRepository.create = jest.fn().mockReturnValue(createdUser);
      usersRepository.save = jest.fn().mockResolvedValue(createdUser);

      const result = await service.create_user(createUserDto, entityManager);

      expect(result).toEqual(createdUser);
    });
  });

  describe.skip('find_by_id_lock', () => {
    it('should find user by id with lock', async () => {
      const id = 'user-id-1';
      usersRepository.findOne = jest.fn().mockResolvedValue(mockUser);

      const result = await service.find_by_id_lock(id, entityManager);

      expect(entityManager.getRepository).toHaveBeenCalledWith(UserSchema);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      usersRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.find_by_id_lock('non-existent-id', entityManager)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe.skip('find_by_ids_lock', () => {
    it('should find users by ids with lock', async () => {
      const userIds = ['user-id-1', 'user-id-2'];
      const mockUsers = [mockUser, { ...mockUser, id: 'user-id-2' }];
      usersRepository.find = jest.fn().mockResolvedValue(mockUsers);

      const result = await service.find_by_ids_lock(userIds, entityManager);

      expect(entityManager.getRepository).toHaveBeenCalledWith(UserSchema);
      expect(usersRepository.find).toHaveBeenCalledWith({
        where: { id: expect.anything() },
        lock: { mode: 'pessimistic_write' },
      });
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array if no users found', async () => {
      usersRepository.find = jest.fn().mockResolvedValue([]);

      const result = await service.find_by_ids_lock(['non-existent-id'], entityManager);

      expect(result).toEqual([]);
    });
  });

  describe.skip('find_by_ids', () => {
    it('should find users by ids', async () => {
      const userIds = ['user-id-1', 'user-id-2'];
      const mockUsers = [mockUser, { ...mockUser, id: 'user-id-2' }];
      usersRepository.find = jest.fn().mockResolvedValue(mockUsers);

      const result = await service.find_by_ids(userIds);

      expect(usersRepository.find).toHaveBeenCalledWith({
        where: { id: expect.anything() },
      });
      expect(result).toEqual(mockUsers);
    });
  });

  describe.skip('delete_user', () => {
    it('should soft-delete user', async () => {
      const userId = 'user-id-1';
      usersRepository.findOne = jest.fn().mockResolvedValue(mockUser);
      usersRepository.softDelete = jest.fn().mockResolvedValue({ affected: 1 });

      const result = await service.delete_user(userId);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(usersRepository.softDelete).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      usersRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.delete_user('non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(service.delete_user('non-existent-id')).rejects.toThrow(
        'Unable to find entity with id',
      );
    });
  });

  describe.skip('set_password', () => {
    it('should set password for user without password', async () => {
      const body: SetPasswordDto = {
        id: 'user-id-1',
        new_password: 'newSecret123',
      };
      const userWithoutPassword = {
        ...mockUser,
        password: undefined,
        has_password: false,
      };
      usersRepository.findOne = jest.fn().mockResolvedValue(userWithoutPassword);
      usersRepository.update = jest.fn().mockResolvedValue({ affected: 1 });
      usersRepository.findOne = jest
        .fn()
        .mockResolvedValueOnce(userWithoutPassword)
        .mockResolvedValueOnce({ ...userWithoutPassword, has_password: true });

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      const updateSpy = jest
        .spyOn(service, 'update_user')
        .mockResolvedValue({ ...userWithoutPassword, has_password: true } as any);

      const result = await service.set_password(body);

      expect(mutationsService.execute).toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalledWith(
        'user-id-1',
        expect.objectContaining({ has_password: true }),
        entityManager,
      );
      updateSpy.mockRestore();
    });

    it('should throw BadRequestException when user already has password', async () => {
      const body: SetPasswordDto = {
        id: 'user-id-1',
        new_password: 'newSecret123',
      };
      const userWithPassword = {
        ...mockUser,
        password: 'hashed',
        has_password: true,
      };
      usersRepository.findOne = jest.fn().mockResolvedValue(userWithPassword);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      await expect(service.set_password(body)).rejects.toThrow(BadRequestException);
      await expect(service.set_password(body)).rejects.toThrow('user already has its password set');
    });
  });

  describe.skip('update_password', () => {
    it('should update password when old password matches', async () => {
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
      const body: UpdatePasswordDto = {
        old_password: 'oldSecret',
        new_password: 'newSecret123',
      };
      const userWithPassword = {
        ...mockUser,
        password: 'existingHash',
        has_password: true,
      };
      usersRepository.findOne = jest.fn().mockResolvedValue(userWithPassword);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      const updateSpy = jest.spyOn(service, 'update_user').mockResolvedValue(mockUser as any);

      await service.update_password('user-id-1', body);

      expect(bcrypt.compareSync).toHaveBeenCalledWith(body.old_password, userWithPassword.password);
      expect(mutationsService.execute).toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalledWith(
        'user-id-1',
        expect.objectContaining({ password: 'hashed_newSecret123' }),
        entityManager,
      );
      updateSpy.mockRestore();
    });

    it('should throw BadRequestException when user has no password', async () => {
      const body: UpdatePasswordDto = {
        old_password: 'old',
        new_password: 'new',
      };
      const userWithoutPassword = {
        ...mockUser,
        password: undefined,
        has_password: false,
      };
      usersRepository.findOne = jest.fn().mockResolvedValue(userWithoutPassword);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      await expect(service.update_password('user-id-1', body)).rejects.toThrow(BadRequestException);
      await expect(service.update_password('user-id-1', body)).rejects.toThrow(
        "user doesn't have a password set",
      );
    });

    it('should throw BadRequestException when old password is wrong', async () => {
      (bcrypt.compareSync as jest.Mock).mockReturnValue(false);
      const body: UpdatePasswordDto = {
        old_password: 'wrong',
        new_password: 'new',
      };
      const userWithPassword = {
        ...mockUser,
        password: 'hash',
        has_password: true,
      };
      usersRepository.findOne = jest.fn().mockResolvedValue(userWithPassword);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      await expect(service.update_password('user-id-1', body)).rejects.toThrow(BadRequestException);
      await expect(service.update_password('user-id-1', body)).rejects.toThrow(
        'invalid credentials',
      );
    });
  });

  describe.skip('search_by_email', () => {
    it('should return paginated users matching email', async () => {
      const body: SearchDto = { value: 'john' };
      const docs = [mockUser];
      usersRepository.findAndCount = jest.fn().mockResolvedValue([docs, 1]);

      const result = await service.search_by_email(body);

      expect(usersRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: expect.anything() },
          skip: 0,
          take: 9,
        }),
      );
      expect(result.docs).toEqual(docs);
      expect(result.total_docs).toBe(1);
      expect(result.page).toBe(1);
      expect(result.has_next_page).toBe(false);
    });

    it('should throw BadRequestException for invalid DTO', async () => {
      const invalidBody = { value: '' } as SearchDto;

      await expect(service.search_by_email(invalidBody)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when pagination limit exceeded', async () => {
      usersRepository.findAndCount = jest.fn();
      const body: SearchDto = {
        value: 'a',
        pagination: { page: 10000, pick: 20 },
      } as SearchDto;

      await expect(service.search_by_email(body)).rejects.toThrow(BadRequestException);
      await expect(service.search_by_email(body)).rejects.toThrow('pagination limit exceeded');
    });
  });

  describe.skip('update_user', () => {
    it('should update user by id', async () => {
      const body: UpdateUserDto = { firstname: 'Jane' };
      const updatedUser = { ...mockUser, ...body };
      usersRepository.update = jest.fn().mockResolvedValue({ affected: 1 });
      usersRepository.findOne = jest.fn().mockResolvedValue(updatedUser);

      const result = await service.update_user('user-id-1', body);

      expect(usersRepository.update).toHaveBeenCalledWith('user-id-1', body);
      expect(result).toEqual(updatedUser);
    });

    it('should throw BadRequestException for invalid DTO', async () => {
      const invalidBody = { firstname: '' } as UpdateUserDto;

      await expect(service.update_user('user-id-1', invalidBody)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
