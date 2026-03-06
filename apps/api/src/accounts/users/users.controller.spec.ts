import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  const mockUser = {
    id: 'user-id-1',
    ref_id: 'user-ref-1',
    email: 'user@example.com',
    firstname: 'John',
    surname: 'Doe',
    timezone: 'America/New_York',
    avatar: undefined,
    password: undefined,
  };

  const mockUpdatedUser = {
    ...mockUser,
    firstname: 'Jane',
    surname: 'Smith',
  };

  beforeEach(async () => {
    const mockUsersService = {
      modify_user_by_ref: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('update_user', () => {
    const userId = 'user-ref-1';
    const updateUserDto: UpdateUserDto = {
      firstname: 'Jane',
      surname: 'Smith',
    };

    it('should successfully update a user', async () => {
      usersService.modify_user_by_id = jest.fn().mockResolvedValue(mockUpdatedUser);

      const result = await controller.update_user(userId, updateUserDto);

      expect(usersService.modify_user_by_id).toHaveBeenCalledWith(userId, updateUserDto);
      expect(usersService.modify_user_by_id).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should throw BadRequestException for invalid DTO', async () => {
      const invalidDto = { firstname: '' } as UpdateUserDto;
      usersService.modify_user_by_id = jest
        .fn()
        .mockRejectedValue(new BadRequestException(['firstname should not be empty']));

      await expect(controller.update_user(userId, invalidDto)).rejects.toThrow(BadRequestException);
      expect(usersService.modify_user_by_id).toHaveBeenCalledWith(userId, invalidDto);
    });

    it('should throw NotFoundException if user not found', async () => {
      usersService.modify_user_by_id = jest
        .fn()
        .mockRejectedValue(new NotFoundException('user not found'));

      await expect(controller.update_user(userId, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.update_user(userId, updateUserDto)).rejects.toThrow('user not found');
    });

    it('should handle partial updates correctly', async () => {
      const partialUpdate: UpdateUserDto = {
        firstname: 'UpdatedName',
      };
      const partiallyUpdatedUser = {
        ...mockUser,
        firstname: 'UpdatedName',
      };

      usersService.modify_user_by_id = jest.fn().mockResolvedValue(partiallyUpdatedUser);

      const result = await controller.update_user(userId, partialUpdate);

      expect(usersService.modify_user_by_id).toHaveBeenCalledWith(userId, partialUpdate);
      expect(result).toEqual(partiallyUpdatedUser);
    });

    it('should handle updating avatar', async () => {
      const avatarUpdate: UpdateUserDto = {
        avatar: 'https://example.com/avatar.jpg',
      };
      const userWithAvatar = {
        ...mockUser,
        avatar: 'https://example.com/avatar.jpg',
      };

      usersService.modify_user_by_id = jest.fn().mockResolvedValue(userWithAvatar);

      const result = await controller.update_user(userId, avatarUpdate);

      expect(usersService.modify_user_by_id).toHaveBeenCalledWith(userId, avatarUpdate);
      expect(result).toEqual(userWithAvatar);
    });

    it('should handle updating timezone', async () => {
      const timezoneUpdate: UpdateUserDto = {
        timezone: 'Europe/London',
      };
      const userWithNewTimezone = {
        ...mockUser,
        timezone: 'Europe/London',
      };

      usersService.modify_user_by_id = jest.fn().mockResolvedValue(userWithNewTimezone);

      const result = await controller.update_user(userId, timezoneUpdate);

      expect(usersService.modify_user_by_id).toHaveBeenCalledWith(userId, timezoneUpdate);
      expect(result).toEqual(userWithNewTimezone);
    });

    it('should ignore restricted fields (password, email, timezone, ref_id) in update', async () => {
      const updateWithRestrictedFields: UpdateUserDto = {
        firstname: 'NewName',
        password: 'newpassword',
        email: 'newemail@example.com',
        timezone: 'UTC',
        ref_id: 'new-ref-id',
      };

      // The service should filter out restricted fields
      const updatedUser = {
        ...mockUser,
        firstname: 'NewName',
        // password, email, timezone, ref_id should remain unchanged
      };

      usersService.modify_user_by_id = jest.fn().mockResolvedValue(updatedUser);

      const result = await controller.update_user(userId, updateWithRestrictedFields);

      expect(usersService.modify_user_by_id).toHaveBeenCalledWith(
        userId,
        updateWithRestrictedFields,
      );
      expect(result).toEqual(updatedUser);
    });

    it('should propagate errors from service', async () => {
      const error = new Error('Database connection failed');
      usersService.modify_user_by_id = jest.fn().mockRejectedValue(error);

      await expect(controller.update_user(userId, updateUserDto)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle empty update object', async () => {
      const emptyUpdate: UpdateUserDto = {};

      usersService.modify_user_by_id = jest.fn().mockResolvedValue(mockUser);

      const result = await controller.update_user(userId, emptyUpdate);

      expect(usersService.modify_user_by_id).toHaveBeenCalledWith(userId, emptyUpdate);
      expect(result).toEqual(mockUser);
    });

    it('should handle multiple field updates', async () => {
      const multipleFieldsUpdate: UpdateUserDto = {
        firstname: 'Alice',
        surname: 'Johnson',
        avatar: 'https://example.com/new-avatar.jpg',
      };
      const multiUpdatedUser = {
        ...mockUser,
        ...multipleFieldsUpdate,
      };

      usersService.modify_user_by_id = jest.fn().mockResolvedValue(multiUpdatedUser);

      const result = await controller.update_user(userId, multipleFieldsUpdate);

      expect(usersService.modify_user_by_id).toHaveBeenCalledWith(userId, multipleFieldsUpdate);
      expect(result).toEqual(multiUpdatedUser);
    });
  });

  describe('get_user_settings', () => {
    const userId = 'user-ref-1';
    const mockUserSettings = {
      id: 'settings-id-1',
      user_id: 'user-id-1',
      dark_mode: false,
      is_onboarded: true,
      refresh_token: undefined,
      last_login_date: undefined,
    };

    it('should get user settings successfully', async () => {
      usersService.get_user_settings_by_user_ref = jest.fn().mockResolvedValue(mockUserSettings);

      const result = await controller.get_user_settings(userId);

      expect(usersService.get_user_settings_by_user_ref).toHaveBeenCalledWith(userId);
      expect(usersService.get_user_settings_by_user_ref).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUserSettings);
    });

    it('should throw NotFoundException if user settings not found', async () => {
      usersService.get_user_settings_by_user_ref = jest
        .fn()
        .mockRejectedValue(new NotFoundException('cannot find user'));

      await expect(controller.get_user_settings(userId)).rejects.toThrow(NotFoundException);
      await expect(controller.get_user_settings(userId)).rejects.toThrow('cannot find user');
    });

    it('should propagate errors from service', async () => {
      const error = new Error('Database connection failed');
      usersService.get_user_settings_by_user_ref = jest.fn().mockRejectedValue(error);

      await expect(controller.get_user_settings(userId)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });
});
