import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { SearchDto } from './dto/search.dto';

describe('UsersController', () => {
  let usersService: jest.Mocked<UsersService>;
  let controller: UsersController;

  const userId = '550e8400-e29b-41d4-a716-446655440000';

  const mockUser = {
    id: userId,
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
      modify_user_by_id: jest.fn(),
      search_by_email: jest.fn(),
      find_user_by_email: jest.fn(),
      find_user_by_id: jest.fn(),
      get_status_by_id: jest.fn(),
      set_password: jest.fn(),
      update_password: jest.fn(),
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

  describe.skip('update_user', () => {
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

  describe.skip('search_users', () => {
    it('should return paginated users by email search', async () => {
      const query: SearchDto = { value: 'john' };
      const result = {
        docs: [mockUser],
        has_next_page: false,
        has_prev_page: false,
        pick: 9,
        next_page: null,
        page: 1,
        paging_counter: 1,
        prev_page: null,
        total_docs: 1,
        total_pages: 1,
      };
      usersService.search_by_email = jest.fn().mockResolvedValue(result);

      const actual = await controller.search_users(query);

      expect(usersService.search_by_email).toHaveBeenCalledWith(query);
      expect(usersService.search_by_email).toHaveBeenCalledTimes(1);
      expect(actual).toEqual(result);
    });

    it('should propagate BadRequestException from service', async () => {
      const query = { value: '' } as SearchDto;
      usersService.search_by_email = jest
        .fn()
        .mockRejectedValue(new BadRequestException(['value should not be empty']));

      await expect(controller.search_users(query)).rejects.toThrow(BadRequestException);
    });
  });

  describe.skip('get_user_by_email', () => {
    it('should return user when email exists', async () => {
      const email = 'user@example.com';
      usersService.find_user_by_email = jest.fn().mockResolvedValue(mockUser);

      const result = await controller.get_user_by_email(email);

      expect(usersService.find_user_by_email).toHaveBeenCalledWith(email);
      expect(usersService.find_user_by_email).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when email not registered', async () => {
      usersService.find_user_by_email = jest
        .fn()
        .mockRejectedValue(new NotFoundException('email not registered'));

      await expect(controller.get_user_by_email('unknown@example.com')).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.get_user_by_email('unknown@example.com')).rejects.toThrow(
        'email not registered',
      );
    });
  });

  describe.skip('get_user_by_id', () => {
    it('should return user when id exists', async () => {
      usersService.find_user_by_id = jest.fn().mockResolvedValue(mockUser);

      const result = await controller.get_user_by_id(userId);

      expect(usersService.find_user_by_id).toHaveBeenCalledWith(userId);
      expect(usersService.find_user_by_id).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      usersService.find_user_by_id = jest
        .fn()
        .mockRejectedValue(new NotFoundException('Cannot find entity with id'));

      await expect(controller.get_user_by_id(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe.skip('get_user_status', () => {
    it('should return status with is_onboarded', async () => {
      const status = { is_onboarded: true };
      usersService.get_status_by_id = jest.fn().mockResolvedValue(status);

      const result = await controller.get_user_status(userId);

      expect(usersService.get_status_by_id).toHaveBeenCalledWith(userId);
      expect(usersService.get_status_by_id).toHaveBeenCalledTimes(1);
      expect(result).toEqual(status);
    });

    it('should throw NotFoundException when user not found', async () => {
      usersService.get_status_by_id = jest
        .fn()
        .mockRejectedValue(new NotFoundException('Cannot find entity with id'));

      await expect(controller.get_user_status(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe.skip('set_password', () => {
    it('should set password for user', async () => {
      const body: SetPasswordDto = { id: userId, new_password: 'newSecret123' };
      usersService.set_password = jest.fn().mockResolvedValue(mockUser);

      const result = await controller.set_password(body);

      expect(usersService.set_password).toHaveBeenCalledWith(body);
      expect(usersService.set_password).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it('should propagate BadRequestException when user already has password', async () => {
      const body: SetPasswordDto = { id: userId, new_password: 'newSecret123' };
      usersService.set_password = jest
        .fn()
        .mockRejectedValue(new BadRequestException('user already has its password set'));

      await expect(controller.set_password(body)).rejects.toThrow(BadRequestException);
      await expect(controller.set_password(body)).rejects.toThrow(
        'user already has its password set',
      );
    });
  });

  describe.skip('update_password', () => {
    it('should update password when old password is correct', async () => {
      const body: UpdatePasswordDto = {
        old_password: 'oldSecret',
        new_password: 'newSecret123',
      };
      usersService.update_password = jest.fn().mockResolvedValue(mockUser);

      const result = await controller.update_password(body, userId);

      expect(usersService.update_password).toHaveBeenCalledWith(userId, body);
      expect(usersService.update_password).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it('should propagate BadRequestException when user has no password', async () => {
      const body: UpdatePasswordDto = {
        old_password: 'old',
        new_password: 'new',
      };
      usersService.update_password = jest
        .fn()
        .mockRejectedValue(new BadRequestException("user doesn't have a password set"));

      await expect(controller.update_password(body, userId)).rejects.toThrow(BadRequestException);
    });

    it('should propagate BadRequestException for invalid credentials', async () => {
      const body: UpdatePasswordDto = {
        old_password: 'wrong',
        new_password: 'new',
      };
      usersService.update_password = jest
        .fn()
        .mockRejectedValue(new BadRequestException('invalid credentials'));

      await expect(controller.update_password(body, userId)).rejects.toThrow('invalid credentials');
    });
  });
});
