import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserSchema } from './schemas/user.schema';
import { UserSettingsSchema } from './schemas/user-settings.schema';
import { MutationsService } from '@app/mutations';
import { InsertUserDto } from './dto/insert-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserSettingsDto } from './dto/user-settings/create-user-settings.dto';
import { EntityManager } from 'typeorm';
import { AccountType } from '@repo/types';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<Repository<UserSchema>>;
  let userSettingsRepository: jest.Mocked<Repository<UserSettingsSchema>>;
  let mutationsService: jest.Mocked<MutationsService>;
  let entityManager: jest.Mocked<EntityManager>;

  const mockUser: Partial<UserSchema> = {
    id: 'user-id-1',
    ref_id: 'user-ref-1',
    email: 'test@example.com',
    firstname: 'John',
    surname: 'Doe',
    username: 'johndoe',
    timezone: 'America/New_York',
    avatar: undefined,
    password: undefined,
    is_email_verified: false,
    display_name: 'John Doe',
  };

  const mockUserSettings: Partial<UserSettingsSchema> = {
    id: 'settings-id-1',
    ref_id: 'settings-ref-1',
    user_id: 'user-id-1',
    dark_mode: false,
    is_onboarded: false,
    refresh_token: undefined,
    last_login_date: undefined,
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
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
      target: UserSchema,
    };

    const mockUserSettingsRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      target: UserSettingsSchema,
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
          provide: getRepositoryToken(UserSettingsSchema),
          useValue: mockUserSettingsRepo,
        },
        {
          provide: MutationsService,
          useValue: mutationsService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(getRepositoryToken(UserSchema));
    userSettingsRepository = module.get(getRepositoryToken(UserSettingsSchema));

    // Setup default entity manager mock
    entityManager.getRepository = jest.fn((target) => {
      if (target === UserSchema) return usersRepository;
      if (target === UserSettingsSchema) return userSettingsRepository;
      return usersRepository; // fallback
    }) as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('is_already_registered', () => {
    it('should throw BadRequestException if email is already registered', async () => {
      const email = 'existing@example.com';
      const username = 'newuser';
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ ...mockUser, email }),
      };
      usersRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(queryBuilder);

      await expect(
        service.is_already_registered(email, username, entityManager),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.is_already_registered(email, username, entityManager),
      ).rejects.toThrow('email already registered');
    });

    it('should throw BadRequestException if username is already registered', async () => {
      const email = 'new@example.com';
      const username = 'johndoe';
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ ...mockUser, username }),
      };
      usersRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(queryBuilder);

      await expect(
        service.is_already_registered(email, username, entityManager),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.is_already_registered(email, username, entityManager),
      ).rejects.toThrow('username already registered');
    });

    it('should return void if email and username are not registered', async () => {
      const email = 'new@example.com';
      const username = 'newuser';
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      usersRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(queryBuilder);

      const result = await service.is_already_registered(
        email,
        username,
        entityManager,
      );
      expect(result).toBeUndefined();
    });
  });

  describe('insert_user', () => {
    const insertUserDto: InsertUserDto = {
      email: 'newuser@example.com',
      firstname: 'Jane',
      surname: 'Smith',
      username: 'janesmith',
      timezone: 'America/Los_Angeles',
      password: undefined,
      type: AccountType.Client,
    };

    it('should create user and settings successfully', async () => {
      const createdUser = {
        ...mockUser,
        ...insertUserDto,
        is_email_verified: false,
        display_name: 'Jane Smith',
      };
      const createdSettings = { ...mockUserSettings };

      usersRepository.create = jest.fn().mockReturnValue(createdUser);
      usersRepository.save = jest.fn().mockResolvedValue(createdUser);
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null), // Email and username not registered
      };
      usersRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(queryBuilder);
      userSettingsRepository.create = jest
        .fn()
        .mockReturnValue(createdSettings);
      userSettingsRepository.save = jest
        .fn()
        .mockResolvedValue(createdSettings);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      const result = await service.insert_other_user(insertUserDto);

      expect(mutationsService.execute).toHaveBeenCalled();
      expect(usersRepository.save).toHaveBeenCalled();
      expect(userSettingsRepository.save).toHaveBeenCalled();
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
        getOne: jest
          .fn()
          .mockResolvedValue({ ...mockUser, email: insertUserDto.email }),
      };
      usersRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(queryBuilder);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      await expect(service.insert_other_user(insertUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid DTO', async () => {
      const invalidDto = { email: 'invalid-email' } as InsertUserDto;

      await expect(service.insert_other_user(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
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
      usersRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(queryBuilder);
      usersRepository.create = jest.fn().mockReturnValue(createdUser);
      usersRepository.save = jest.fn().mockResolvedValue(createdUser);
      userSettingsRepository.create = jest
        .fn()
        .mockReturnValue(mockUserSettings);
      userSettingsRepository.save = jest
        .fn()
        .mockResolvedValue(mockUserSettings);

      const result = await service.insert_other_user(
        insertUserDto,
        entityManager,
      );

      expect(mutationsService.execute).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('insert_admin', () => {
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
      usersRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(queryBuilder);
      const createdAdmin = {
        ...mockUser,
        ...insertAdminDto,
        type: 'Admins' as any,
        is_email_verified: false,
      };
      usersRepository.create = jest.fn().mockReturnValue(createdAdmin);
      usersRepository.save = jest.fn().mockResolvedValue(createdAdmin);
      userSettingsRepository.create = jest
        .fn()
        .mockReturnValue(mockUserSettings);
      userSettingsRepository.save = jest
        .fn()
        .mockResolvedValue(mockUserSettings);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      const result = await service.insert_admin(insertAdminDto);

      expect(result.type).toBe('Admins');
    });
  });

  describe('insert_other_user', () => {
    const insertUserDto: InsertUserDto = {
      email: 'user@example.com',
      firstname: 'Regular',
      surname: 'User',
      username: 'regularuser',
      timezone: 'UTC',
      password: undefined,
      type: AccountType.Client,
    };

    it('should create regular user successfully', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      usersRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(queryBuilder);
      const createdUser = {
        ...mockUser,
        ...insertUserDto,
        is_email_verified: false,
      };
      usersRepository.create = jest.fn().mockReturnValue(createdUser);
      usersRepository.save = jest.fn().mockResolvedValue(createdUser);
      userSettingsRepository.create = jest
        .fn()
        .mockReturnValue(mockUserSettings);
      userSettingsRepository.save = jest
        .fn()
        .mockResolvedValue(mockUserSettings);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      const result = await service.insert_other_user(insertUserDto);

      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if type is Admins', async () => {
      const adminDto = {
        ...insertUserDto,
        type: 'Admins' as any,
      };

      await expect(service.insert_other_user(adminDto as any)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.insert_other_user(adminDto as any)).rejects.toThrow(
        'type cannot be admin',
      );
    });
  });

  describe('find_user_by_email', () => {
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

      await expect(
        service.find_user_by_email('nonexistent@example.com'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.find_user_by_email('nonexistent@example.com'),
      ).rejects.toThrow('email not registered');
    });

    it('should work with provided session', async () => {
      const sessionRepo = {
        findOne: jest.fn().mockResolvedValue(mockUser),
      };
      entityManager.getRepository = jest.fn().mockReturnValue(sessionRepo);

      const result = await service.find_user_by_email(
        'test@example.com',
        entityManager,
      );

      expect(result).toEqual(mockUser);
      expect(sessionRepo.findOne).toHaveBeenCalled();
    });
  });

  describe('find_by_ref', () => {
    it('should find user by ref_id successfully', async () => {
      usersRepository.findOne = jest.fn().mockResolvedValue(mockUser);

      const result = await service.find_by_ref('user-ref-1');

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { ref_id: 'user-ref-1' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      usersRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.find_by_ref('non-existent-ref')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.find_by_ref('non-existent-ref')).rejects.toThrow(
        'user not found',
      );
    });
  });

  describe('get_user_settings_by_user_ref', () => {
    it('should get user settings by user ref successfully', async () => {
      usersRepository.findOne = jest.fn().mockResolvedValue(mockUser);
      const sessionRepo = {
        findOne: jest.fn().mockResolvedValue(mockUserSettings),
      };
      entityManager.getRepository = jest.fn().mockReturnValue(sessionRepo);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      const result = await service.get_user_settings_by_user_ref('user-ref-1');

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { ref_id: 'user-ref-1' },
        lock: { mode: 'pessimistic_write' },
      });
      expect(sessionRepo.findOne).toHaveBeenCalledWith({
        where: { user_id: mockUser.id },
      });
      expect(result).toEqual(mockUserSettings);
    });

    it('should throw NotFoundException if user settings not found', async () => {
      usersRepository.findOne = jest.fn().mockResolvedValue(mockUser);
      const sessionRepo = {
        findOne: jest.fn().mockResolvedValue(null),
      };
      entityManager.getRepository = jest.fn().mockReturnValue(sessionRepo);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      await expect(
        service.get_user_settings_by_user_ref('user-ref-1'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.get_user_settings_by_user_ref('user-ref-1'),
      ).rejects.toThrow('cannot find user');
    });

    it('should work with provided session', async () => {
      usersRepository.findOne = jest.fn().mockResolvedValue(mockUser);
      const sessionRepo = {
        findOne: jest.fn().mockResolvedValue(mockUserSettings),
      };
      entityManager.getRepository = jest.fn().mockReturnValue(sessionRepo);

      const result = await service.get_user_settings_by_user_ref(
        'user-ref-1',
        entityManager,
      );

      expect(result).toEqual(mockUserSettings);
      expect(mutationsService.execute).not.toHaveBeenCalled();
    });
  });

  describe('update_user_settings_by_user_id', () => {
    const updateSettingsDto = {
      dark_mode: true,
      is_onboarded: true,
    };

    it('should update user settings successfully', async () => {
      userSettingsRepository.findOne = jest
        .fn()
        .mockResolvedValue(mockUserSettings);
      userSettingsRepository.update = jest
        .fn()
        .mockResolvedValue({ affected: 1 });
      userSettingsRepository.findOne = jest
        .fn()
        .mockResolvedValueOnce(mockUserSettings)
        .mockResolvedValueOnce({ ...mockUserSettings, ...updateSettingsDto });

      const result = await service.update_user_settings_by_user_id(
        'user-id-1',
        updateSettingsDto,
      );

      expect(userSettingsRepository.findOne).toHaveBeenCalledWith({
        where: { user_id: 'user-id-1' },
      });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if user settings not found', async () => {
      userSettingsRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(
        service.update_user_settings_by_user_id(
          'non-existent-id',
          updateSettingsDto,
        ),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update_user_settings_by_user_id(
          'non-existent-id',
          updateSettingsDto,
        ),
      ).rejects.toThrow('user not registerd');
    });

    it('should work with provided session', async () => {
      userSettingsRepository.findOne = jest
        .fn()
        .mockResolvedValue(mockUserSettings);
      userSettingsRepository.update = jest
        .fn()
        .mockResolvedValue({ affected: 1 });

      const result = await service.update_user_settings_by_user_id(
        'user-id-1',
        updateSettingsDto,
        entityManager,
      );

      expect(result).toBeDefined();
    });
  });

  describe('create_user', () => {
    const createUserDto: CreateUserDto = {
      email: 'user@example.com',
      firstname: 'Test',
      surname: 'User',
      timezone: 'UTC',
      ref_id: 'ref-123',
      avatar: undefined,
      index: 0,
      password: undefined,
      username: 'hellothere',
      type: AccountType.Client,
      display_name: 'Test User',
      is_email_verified: false,
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

      await expect(service.create_user(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should work with provided session', async () => {
      const createdUser = { ...mockUser, ...createUserDto };
      usersRepository.create = jest.fn().mockReturnValue(createdUser);
      usersRepository.save = jest.fn().mockResolvedValue(createdUser);

      const result = await service.create_user(createUserDto, entityManager);

      expect(result).toEqual(createdUser);
    });
  });

  describe('create_settings', () => {
    const createSettingsDto: CreateUserSettingsDto = {
      user_id: 'user-id-1',
      ref_id: 'settings-ref-1',
      dark_mode: true,
      is_onboarded: true,
      refresh_token: undefined,
      last_login_date: undefined,
      index: 0,
    };

    it('should create user settings successfully', async () => {
      const createdSettings = { ...mockUserSettings, ...createSettingsDto };
      userSettingsRepository.create = jest
        .fn()
        .mockReturnValue(createdSettings);
      userSettingsRepository.save = jest
        .fn()
        .mockResolvedValue(createdSettings);

      const result = await service.create_settings(createSettingsDto);

      expect(userSettingsRepository.create).toHaveBeenCalledWith(
        createSettingsDto,
      );
      expect(userSettingsRepository.save).toHaveBeenCalledWith(createdSettings);
      expect(result).toEqual(createdSettings);
    });

    it('should throw BadRequestException for invalid DTO', async () => {
      const invalidDto = { user_id: 'invalid' } as CreateUserSettingsDto;

      await expect(service.create_settings(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('find_by_id_lock', () => {
    it('should find user by id with lock', async () => {
      const userId = 'user-id-1';
      usersRepository.findOne = jest.fn().mockResolvedValue(mockUser);

      const result = await service.find_by_id_lock(userId, entityManager);

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'non-existent-id';
      usersRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(
        service.find_by_id_lock(userId, entityManager),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('find_by_ref_id_lock', () => {
    it('should find user by ref_id with lock', async () => {
      const refId = 'user-ref-1';
      usersRepository.findOne = jest.fn().mockResolvedValue(mockUser);

      const result = await service.find_by_ref_id_lock(refId, entityManager);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { ref_id: refId },
        lock: { mode: 'pessimistic_write' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      const refId = 'non-existent-ref';
      usersRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(
        service.find_by_ref_id_lock(refId, entityManager),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.find_by_ref_id_lock(refId, entityManager),
      ).rejects.toThrow('user not found');
    });
  });

  describe('find_by_ids_lock', () => {
    it('should find users by ids with lock', async () => {
      const userIds = ['user-id-1', 'user-id-2'];
      const mockUsers = [mockUser, { ...mockUser, id: 'user-id-2' }];
      usersRepository.find = jest.fn().mockResolvedValue(mockUsers);

      const result = await service.find_by_ids_lock(userIds, entityManager);

      expect(usersRepository.find).toHaveBeenCalledWith({
        where: { id: expect.anything() },
        lock: { mode: 'pessimistic_write' },
      });
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array if no users found', async () => {
      const userIds = ['non-existent-id'];
      usersRepository.find = jest.fn().mockResolvedValue([]);

      const result = await service.find_by_ids_lock(userIds, entityManager);

      expect(result).toEqual([]);
    });
  });

  describe('find_by_ref_ids_lock', () => {
    it('should find users by ref_ids with lock', async () => {
      const refIds = ['user-ref-1', 'user-ref-2'];
      const mockUsers = [mockUser, { ...mockUser, ref_id: 'user-ref-2' }];
      usersRepository.find = jest.fn().mockResolvedValue(mockUsers);

      const result = await service.find_by_ref_ids_lock(refIds, entityManager);

      expect(usersRepository.find).toHaveBeenCalledWith({
        where: { ref_id: expect.anything() },
        lock: { mode: 'pessimistic_write' },
      });
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array if no users found', async () => {
      const refIds = ['non-existent-ref'];
      usersRepository.find = jest.fn().mockResolvedValue([]);

      const result = await service.find_by_ref_ids_lock(refIds, entityManager);

      expect(result).toEqual([]);
    });
  });

  describe('delete_user', () => {
    it('should delete user and settings successfully', async () => {
      const userId = 'user-id-1';
      userSettingsRepository.findOne = jest
        .fn()
        .mockResolvedValue(mockUserSettings);
      userSettingsRepository.delete = jest
        .fn()
        .mockResolvedValue({ affected: 1 });
      usersRepository.delete = jest.fn().mockResolvedValue({ affected: 1 });

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      const result = await service.delete_user(userId);

      expect(userSettingsRepository.findOne).toHaveBeenCalledWith({
        where: { user_id: userId },
        lock: { mode: 'pessimistic_write' },
      });
      expect(userSettingsRepository.delete).toHaveBeenCalled();
      expect(usersRepository.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user settings not found', async () => {
      const userId = 'non-existent-id';
      userSettingsRepository.findOne = jest.fn().mockResolvedValue(null);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      await expect(service.delete_user(userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.delete_user(userId)).rejects.toThrow(
        'cannot find user',
      );
    });
  });
});
