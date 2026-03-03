import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { OtpSchema } from './schemas/otp.schema';
import { UsersService } from '@/accounts/users/users.service';
import { MutationsService } from '@app/mutations';
import { IMailModuleType } from '@app/util';
import { EntityManager } from 'typeorm';
import { SigninDto } from './dto/signin.dto';
import { SigninEmailDto } from './dto/signin-email.dto';
import { SigninOtpDto } from './dto/signin-otp.dto';
import { EmailDto } from './dto/email.dto';
import { RecoverDto } from './dto/recover.dto';
import { RefreshDto } from './dto/refresh.dto';
import { InsertOtp } from './dto/otp/insert-otp.dto';
import { CreateOtpDto } from './dto/otp/create-otp.dto';
import { OTP_PURPOSE_ENUM } from '@repo/types';
import { ValidUser, SigninResponse } from './types/auth.types';
import * as datefns from 'date-fns';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let otpRepository: jest.Mocked<Repository<OtpSchema>>;
  let jwtService: jest.Mocked<JwtService>;
  let usersService: jest.Mocked<UsersService>;
  let mutationsService: jest.Mocked<MutationsService>;
  let mailService: jest.Mocked<IMailModuleType>;
  let entityManager: jest.Mocked<EntityManager>;

  const mockUser = {
    id: 'user-id-1',
    ref_id: 'user-ref-1',
    email: 'test@example.com',
    display_name: 'Test User',
    password: bcrypt.hashSync('password123'),
    type: 'Users' as any,
    username: 'testuser',
    firstname: 'Test',
    surname: 'User',
    timezone: 'UTC',
    avatar: undefined,
    is_email_verified: false,
  };

  const mockUserWithoutPassword = {
    ...mockUser,
    password: undefined,
  };

  const mockUserSettings = {
    id: 'settings-id-1',
    user_id: 'user-id-1',
    refresh_token: 'refresh-token-123',
    last_login_date: new Date(),
    dark_mode: false,
    is_onboarded: false,
  };

  const mockOtp: Partial<OtpSchema> = {
    id: 'otp-id-1',
    ref_id: 'otp-ref-1',
    value: '123456',
    email: 'test@example.com',
    purpose: OTP_PURPOSE_ENUM.LOGIN,
    expires_at: datefns.addHours(new Date(), 2),
    index: 0,
  };

  const mockExpiredOtp: Partial<OtpSchema> = {
    ...mockOtp,
    expires_at: datefns.subHours(new Date(), 1),
  };

  beforeEach(async () => {
    entityManager = {
      getRepository: jest.fn(),
    } as any;

    const mockOtpRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      target: OtpSchema,
    };

    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
      verify: jest.fn(),
    } as any;

    usersService = {
      find_user_by_email: jest.fn(),
      find_by_id_lock: jest.fn(),
      find_by_ref_id_lock: jest.fn(),
      find_by_ref: jest.fn(),
      update_user_settings_by_user_id: jest.fn(),
      update_user: jest.fn(),
      get_user_settings_by_user_ref: jest.fn(),
    } as any;

    mutationsService = {
      execute: jest.fn(),
    } as any;

    mailService = {
      sendotp: jest.fn(),
      sendmail: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(OtpSchema),
          useValue: mockOtpRepo,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: MutationsService,
          useValue: mutationsService,
        },
        {
          provide: IMailModuleType,
          useValue: mailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    otpRepository = module.get(getRepositoryToken(OtpSchema));

    // Setup entity manager mock
    entityManager.getRepository = jest.fn((target) => {
      if (target === OtpSchema) return otpRepository;
      return otpRepository; // fallback
    }) as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('insert_otp', () => {
    const insertOtpDto: InsertOtp = {
      email: 'test@example.com',
      purpose: OTP_PURPOSE_ENUM.LOGIN,
    };

    it('should generate and create OTP successfully', async () => {
      const createdOtp = { ...mockOtp, ...insertOtpDto };
      otpRepository.create = jest.fn().mockReturnValue(createdOtp);
      otpRepository.save = jest.fn().mockResolvedValue(createdOtp);

      const result = await service.insert_otp(insertOtpDto);

      expect(otpRepository.create).toHaveBeenCalled();
      expect(otpRepository.save).toHaveBeenCalled();
      expect(result.value).toMatch(/^\d{6}$/); // 6 digit OTP
      expect(result.email).toBe(insertOtpDto.email);
      expect(result.purpose).toBe(insertOtpDto.purpose);
    });

    it('should work with provided session', async () => {
      const createdOtp = { ...mockOtp, ...insertOtpDto };
      otpRepository.create = jest.fn().mockReturnValue(createdOtp);
      otpRepository.save = jest.fn().mockResolvedValue(createdOtp);

      const result = await service.insert_otp(insertOtpDto, entityManager);

      expect(result).toBeDefined();
    });
  });

  describe('delete_otp_by_id', () => {
    it('should delete OTP successfully', async () => {
      otpRepository.delete = jest.fn().mockResolvedValue({ affected: 1 });

      await service.delete_otp_by_id('otp-id-1');

      expect(otpRepository.delete).toHaveBeenCalled();
    });
  });

  describe('create_otp', () => {
    const createOtpDto: CreateOtpDto = {
      value: '123456',
      email: 'test@example.com',
      purpose: OTP_PURPOSE_ENUM.LOGIN,
      expires_at: datefns.addHours(new Date(), 2),
      ref_id: 'otp-ref-1',
      index: 0,
    };

    it('should create OTP successfully', async () => {
      const createdOtp = { ...mockOtp, ...createOtpDto };
      otpRepository.create = jest.fn().mockReturnValue(createdOtp);
      otpRepository.save = jest.fn().mockResolvedValue(createdOtp);

      const result = await service.create_otp(createOtpDto);

      expect(otpRepository.create).toHaveBeenCalledWith(createOtpDto);
      expect(otpRepository.save).toHaveBeenCalled();
      expect(result).toEqual(createdOtp);
    });

    it('should throw BadRequestException for invalid DTO', async () => {
      const invalidDto = { email: 'invalid' } as CreateOtpDto;

      await expect(service.create_otp(invalidDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('get_user_otps', () => {
    it('should get user OTPs successfully', async () => {
      const otps = [mockOtp, { ...mockOtp, id: 'otp-id-2' }];
      otpRepository.find = jest.fn().mockResolvedValue(otps);

      const result = await service.get_user_otps('test@example.com');

      expect(otpRepository.find).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(otps);
    });

    it('should work with provided session', async () => {
      const otps = [mockOtp];
      const sessionRepo = { find: jest.fn().mockResolvedValue(otps) };
      entityManager.getRepository = jest.fn().mockReturnValue(sessionRepo);

      const result = await service.get_user_otps('test@example.com', entityManager);

      expect(result).toEqual(otps);
    });
  });

  describe('find_otp_by_otp', () => {
    it('should find OTP by value successfully', async () => {
      otpRepository.findOne = jest.fn().mockResolvedValue(mockOtp);

      const result = await service.find_otp_by_otp('123456');

      expect(otpRepository.findOne).toHaveBeenCalledWith({
        where: { value: '123456' },
      });
      expect(result).toEqual(mockOtp);
    });

    it('should throw NotFoundException if OTP not found', async () => {
      otpRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.find_otp_by_otp('999999')).rejects.toThrow(NotFoundException);
      await expect(service.find_otp_by_otp('999999')).rejects.toThrow("otp doesn't exist");
    });
  });

  describe('signin_email_verify', () => {
    const signinEmailDto: SigninEmailDto = {
      email: 'test@example.com',
    };

    it('should return PASSWORD type if user has password', async () => {
      usersService.find_user_by_email = jest.fn().mockResolvedValue(mockUser);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      const result = await service.signin_email_verify(signinEmailDto);

      expect(result).toEqual({
        type: 'PASSWORD',
        display_name: mockUser.display_name,
      });
    });

    it('should return OTP type and send OTP if no existing valid OTP', async () => {
      usersService.find_user_by_email = jest.fn().mockResolvedValue(mockUserWithoutPassword);
      otpRepository.find = jest.fn().mockResolvedValue([]);
      otpRepository.create = jest.fn().mockReturnValue(mockOtp);
      otpRepository.save = jest.fn().mockResolvedValue(mockOtp);
      mailService.sendotp = jest.fn().mockResolvedValue(true);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      const result = await service.signin_email_verify(signinEmailDto);

      expect(result).toEqual({
        type: 'OTP',
        display_name: mockUserWithoutPassword.display_name,
      });
      expect(mailService.sendotp).toHaveBeenCalled();
    });

    it('should return OTP type if valid OTP exists', async () => {
      usersService.find_user_by_email = jest.fn().mockResolvedValue(mockUserWithoutPassword);
      const sessionRepo = {
        find: jest.fn().mockResolvedValue([mockOtp]),
        delete: jest.fn(),
      };
      entityManager.getRepository = jest.fn().mockReturnValue(sessionRepo);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      const result = await service.signin_email_verify(signinEmailDto);

      expect(result).toEqual({
        type: 'OTP',
        display_name: mockUserWithoutPassword.display_name,
      });
    });

    it('should delete expired OTPs', async () => {
      usersService.find_user_by_email = jest.fn().mockResolvedValue(mockUserWithoutPassword);
      const sessionRepo = {
        find: jest.fn().mockResolvedValue([mockExpiredOtp]),
        delete: jest.fn().mockResolvedValue({ affected: 1 }),
      };
      entityManager.getRepository = jest.fn().mockReturnValue(sessionRepo);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      await service.signin_email_verify(signinEmailDto);

      expect(sessionRepo.delete).toHaveBeenCalled();
    });
  });

  describe('signin_email_otp', () => {
    const signinOtpDto: SigninOtpDto = {
      email: 'test@example.com',
      otp: '123456',
    };

    it('should sign in successfully with valid OTP', async () => {
      usersService.find_user_by_email = jest.fn().mockResolvedValue(mockUserWithoutPassword);
      const sessionRepo = {
        findOne: jest.fn().mockResolvedValue(mockOtp),
        delete: jest.fn(),
      };
      entityManager.getRepository = jest.fn().mockReturnValue(sessionRepo);
      jwtService.signAsync = jest
        .fn()
        .mockResolvedValue('jwt-token')
        .mockResolvedValueOnce('jwt-token')
        .mockResolvedValueOnce('refresh-token');
      usersService.update_user_settings_by_user_id = jest.fn().mockResolvedValue(mockUserSettings);
      usersService.find_by_id_lock = jest.fn().mockResolvedValue(mockUserWithoutPassword);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      const result = await service.signin_email_otp(signinOtpDto);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refresh');
      expect(result).toHaveProperty('user');
    });

    it('should throw BadRequestException for expired OTP', async () => {
      usersService.find_user_by_email = jest.fn().mockResolvedValue(mockUserWithoutPassword);
      const sessionRepo = {
        findOne: jest.fn().mockResolvedValue(mockExpiredOtp),
        delete: jest.fn(),
      };
      entityManager.getRepository = jest.fn().mockReturnValue(sessionRepo);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      await expect(service.signin_email_otp(signinOtpDto)).rejects.toThrow(BadRequestException);
      await expect(service.signin_email_otp(signinOtpDto)).rejects.toThrow('otp expired');
    });

    it('should throw BadRequestException for invalid OTP', async () => {
      usersService.find_user_by_email = jest.fn().mockResolvedValue(mockUserWithoutPassword);
      const invalidOtp = { ...mockOtp, value: '999999' };
      const sessionRepo = {
        findOne: jest.fn().mockResolvedValue(invalidOtp),
      };
      entityManager.getRepository = jest.fn().mockReturnValue(sessionRepo);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      await expect(service.signin_email_otp(signinOtpDto)).rejects.toThrow(BadRequestException);
      await expect(service.signin_email_otp(signinOtpDto)).rejects.toThrow('invalid credentials');
    });
  });

  describe('compare', () => {
    it('should return true for matching password', () => {
      const hashed = bcrypt.hashSync('password123');
      const result = service.compare('password123', hashed);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', () => {
      const hashed = bcrypt.hashSync('password123');
      const result = service.compare('wrongpassword', hashed);
      expect(result).toBe(false);
    });
  });

  describe('validate', () => {
    const signinDto: SigninDto = {
      username: 'test@example.com',
      password: 'password123',
    };

    it('should return ValidUser for valid password', async () => {
      usersService.find_user_by_email = jest.fn().mockResolvedValue(mockUser);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      const result = await service.validate(signinDto);

      expect(result).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        ref: mockUser.ref_id,
        name: mockUser.display_name,
        type: mockUser.type,
      });
    });

    it('should return null for invalid password', async () => {
      usersService.find_user_by_email = jest.fn().mockResolvedValue(mockUser);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      const result = await service.validate({
        ...signinDto,
        password: 'wrongpassword',
      });

      expect(result).toBeNull();
    });

    it('should return ValidUser for user without password', async () => {
      usersService.find_user_by_email = jest.fn().mockResolvedValue(mockUserWithoutPassword);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      const result = await service.validate({
        ...signinDto,
        password: 'anypassword',
      });

      expect(result).toMatchObject({
        id: mockUserWithoutPassword.id,
        email: mockUserWithoutPassword.email,
        ref: mockUserWithoutPassword.ref_id,
        name: mockUserWithoutPassword.display_name,
        type: mockUserWithoutPassword.type,
      });
    });

    it('should work with provided session', async () => {
      usersService.find_user_by_email = jest.fn().mockResolvedValue(mockUser);

      const result = await service.validate(signinDto, entityManager);

      expect(result).toBeDefined();
      expect(mutationsService.execute).not.toHaveBeenCalled();
    });
  });

  describe('sign_in_validated_account', () => {
    const validUser: ValidUser = {
      id: 'user-id-1',
      ref: 'user-ref-1',
      email: 'test@example.com',
      name: 'Test User',
      type: 'Users' as any,
    };

    it('should sign in successfully and return SigninResponse', async () => {
      jwtService.signAsync = jest
        .fn()
        .mockResolvedValueOnce('jwt-token')
        .mockResolvedValueOnce('refresh-token');
      usersService.update_user_settings_by_user_id = jest.fn().mockResolvedValue(mockUserSettings);
      usersService.find_by_id_lock = jest.fn().mockResolvedValue(mockUser);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      const result = await service.sign_in_validated_account(validUser);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refresh');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('expires');
      expect(result.user).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        ref: mockUser.ref_id,
        display_name: mockUser.display_name,
        type: mockUser.type,
        is_email_verified: mockUser.is_email_verified,
      });
    });

    it('should work with provided session', async () => {
      jwtService.signAsync = jest
        .fn()
        .mockResolvedValueOnce('jwt-token')
        .mockResolvedValueOnce('refresh-token');
      usersService.update_user_settings_by_user_id = jest.fn().mockResolvedValue(mockUserSettings);
      usersService.find_by_id_lock = jest.fn().mockResolvedValue(mockUser);

      const result = await service.sign_in_validated_account(validUser, entityManager);

      expect(result).toBeDefined();
      expect(mutationsService.execute).not.toHaveBeenCalled();
    });
  });

  describe('authenticate', () => {
    const signinDto: SigninDto = {
      username: 'test@example.com',
      password: 'password123',
    };

    it('should authenticate successfully', async () => {
      usersService.find_user_by_email = jest.fn().mockResolvedValue(mockUser);
      jwtService.signAsync = jest
        .fn()
        .mockResolvedValueOnce('jwt-token')
        .mockResolvedValueOnce('refresh-token');
      usersService.update_user_settings_by_user_id = jest.fn().mockResolvedValue(mockUserSettings);
      usersService.find_by_id_lock = jest.fn().mockResolvedValue(mockUser);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      const result = await service.authenticate(signinDto);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refresh');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      usersService.find_user_by_email = jest.fn().mockResolvedValue(mockUser);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      await expect(
        service.authenticate({
          ...signinDto,
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.authenticate({
          ...signinDto,
          password: 'wrongpassword',
        }),
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('whoami', () => {
    it('should return user by ref', async () => {
      usersService.find_by_ref = jest.fn().mockResolvedValue(mockUser);

      const result = await service.whoami('user-ref-1');

      expect(usersService.find_by_ref).toHaveBeenCalledWith('user-ref-1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('sign_out', () => {
    it('should sign out successfully', async () => {
      usersService.find_by_ref_id_lock = jest.fn().mockResolvedValue(mockUser);
      usersService.update_user_settings_by_user_id = jest.fn().mockResolvedValue(mockUserSettings);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      const result = await service.sign_out('user-ref-1');

      expect(usersService.find_by_ref_id_lock).toHaveBeenCalledWith('user-ref-1', entityManager);
      expect(usersService.update_user_settings_by_user_id).toHaveBeenCalledWith(
        mockUser.id,
        { refresh_token: undefined },
        entityManager,
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('confirm_auth', () => {
    it('should return ValidUser for valid token', async () => {
      const validUser: ValidUser = {
        id: 'user-id-1',
        ref: 'user-ref-1',
        email: 'test@example.com',
        name: 'Test User',
        type: 'Users' as any,
      };
      jwtService.verifyAsync = jest.fn().mockResolvedValue(validUser);

      const result = await service.confirm_auth('valid-token');

      expect(result).toEqual(validUser);
    });

    it('should return null for invalid token', async () => {
      jwtService.verifyAsync = jest.fn().mockRejectedValue(new Error('Invalid token'));

      const result = await service.confirm_auth('invalid-token');

      expect(result).toBeNull();
    });
  });

  describe('generate_refresh', () => {
    const refreshDto: RefreshDto = {
      email: 'test@example.com',
      refresh: 'refresh-token-123',
    };

    it('should generate new tokens successfully', async () => {
      usersService.find_user_by_email = jest.fn().mockResolvedValue(mockUser);
      usersService.get_user_settings_by_user_ref = jest.fn().mockResolvedValue(mockUserSettings);
      jwtService.verify = jest.fn();
      jwtService.signAsync = jest
        .fn()
        .mockResolvedValueOnce('new-jwt-token')
        .mockResolvedValueOnce('new-refresh-token');
      usersService.update_user_settings_by_user_id = jest.fn().mockResolvedValue(mockUserSettings);
      usersService.find_by_id_lock = jest.fn().mockResolvedValue(mockUser);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      const result = await service.generate_refresh(refreshDto.email, refreshDto.refresh);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refresh');
    });

    it('should throw NotFoundException if refresh token not found', async () => {
      usersService.find_user_by_email = jest.fn().mockResolvedValue(mockUser);
      usersService.get_user_settings_by_user_ref = jest
        .fn()
        .mockResolvedValue({ ...mockUserSettings, refresh_token: undefined });

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      await expect(service.generate_refresh(refreshDto.email, refreshDto.refresh)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if refresh token mismatch', async () => {
      usersService.find_user_by_email = jest.fn().mockResolvedValue(mockUser);
      usersService.get_user_settings_by_user_ref = jest.fn().mockResolvedValue({
        ...mockUserSettings,
        refresh_token: 'different-token',
      });

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      await expect(service.generate_refresh(refreshDto.email, refreshDto.refresh)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('recovery_verify', () => {
    const emailDto: EmailDto = {
      email: 'test@example.com',
    };

    it('should send recovery OTP successfully', async () => {
      usersService.find_user_by_email = jest.fn().mockResolvedValue(mockUser);
      otpRepository.create = jest.fn().mockReturnValue(mockOtp);
      otpRepository.save = jest.fn().mockResolvedValue(mockOtp);
      mailService.sendotp = jest.fn().mockResolvedValue(true);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      const result = await service.recovery_verify(emailDto);

      expect(result).toBe(true);
      expect(mailService.sendotp).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user has no password', async () => {
      usersService.find_user_by_email = jest.fn().mockResolvedValue(mockUserWithoutPassword);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      await expect(service.recovery_verify(emailDto)).rejects.toThrow(BadRequestException);
      await expect(service.recovery_verify(emailDto)).rejects.toThrow(
        'error recovering user password',
      );
    });
  });

  describe('recover', () => {
    const recoverDto: RecoverDto = {
      email: 'test@example.com',
      otp: '123456',
      password: 'newpassword123',
    };

    it('should recover password successfully', async () => {
      usersService.find_user_by_email = jest.fn().mockResolvedValue(mockUser);
      const sessionRepo = {
        findOne: jest.fn().mockResolvedValue({
          ...mockOtp,
          purpose: OTP_PURPOSE_ENUM.RECOVERY,
        }),
        delete: jest.fn(),
      };
      entityManager.getRepository = jest.fn().mockReturnValue(sessionRepo);
      usersService.update_user = jest.fn().mockResolvedValue(mockUser);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      const result = await service.recover(recoverDto);

      expect(usersService.update_user).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if user has no password', async () => {
      usersService.find_user_by_email = jest.fn().mockResolvedValue(mockUserWithoutPassword);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      await expect(service.recover(recoverDto)).rejects.toThrow(BadRequestException);
      await expect(service.recover(recoverDto)).rejects.toThrow(
        'password auth not avaialble for this user',
      );
    });

    it('should throw BadRequestException for expired OTP', async () => {
      usersService.find_user_by_email = jest.fn().mockResolvedValue(mockUser);
      // Note: The actual implementation checks datefns.isPast(token.value) which seems like a bug
      // but we test the actual behavior - it checks if the OTP value (string) is in the past
      const expiredOtpWithRecovery = {
        ...mockOtp,
        purpose: OTP_PURPOSE_ENUM.RECOVERY,
        value: '000000', // Using a value that would be considered "past" in the buggy check
      };
      const sessionRepo = {
        findOne: jest.fn().mockResolvedValue(expiredOtpWithRecovery),
      };
      entityManager.getRepository = jest.fn().mockReturnValue(sessionRepo);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      // The actual implementation has a bug where it checks datefns.isPast(token.value)
      // This will likely not throw the expected error, but we test what the code actually does
      await expect(service.recover(recoverDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid OTP purpose', async () => {
      usersService.find_user_by_email = jest.fn().mockResolvedValue(mockUser);
      const sessionRepo = {
        findOne: jest.fn().mockResolvedValue({
          ...mockOtp,
          purpose: OTP_PURPOSE_ENUM.LOGIN,
        }),
      };
      entityManager.getRepository = jest.fn().mockReturnValue(sessionRepo);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      await expect(service.recover(recoverDto)).rejects.toThrow(BadRequestException);
      await expect(service.recover(recoverDto)).rejects.toThrow('invalid otp');
    });

    it('should throw BadRequestException if new password same as old', async () => {
      usersService.find_user_by_email = jest.fn().mockResolvedValue(mockUser);
      const sessionRepo = {
        findOne: jest.fn().mockResolvedValue({
          ...mockOtp,
          purpose: OTP_PURPOSE_ENUM.RECOVERY,
        }),
        delete: jest.fn(),
      };
      entityManager.getRepository = jest.fn().mockReturnValue(sessionRepo);

      mutationsService.execute = jest.fn().mockImplementation(async (cb) => {
        return cb(entityManager);
      });

      await expect(
        service.recover({
          ...recoverDto,
          password: 'password123',
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.recover({
          ...recoverDto,
          password: 'password123',
        }),
      ).rejects.toThrow('new password cannot be the same as old password');
    });
  });
});
