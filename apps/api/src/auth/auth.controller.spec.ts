import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SigninEmailDto } from './dto/signin-email.dto';
import { SigninOtpDto } from './dto/signin-otp.dto';
import { EmailDto } from './dto/email.dto';
import { RecoverDto } from './dto/recover.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ValidUser, SigninResponse } from './types/auth.types';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockValidUser: ValidUser = {
    id: 'user-id-1',
    ref: 'user-ref-1',
    email: 'test@example.com',
    name: 'Test User',
    type: 'Users' as any,
  };

  const mockReqExpress = {
    user: {
      ...mockValidUser,
      token: 'jwt-token-123',
    },
  } as any;

  const mockSigninResponse: SigninResponse = {
    token: 'jwt-token',
    refresh: 'refresh-token',
    user: {
      id: 'user-id-1',
      ref: 'user-ref-1',
      display_name: 'Test User',
      avatar: undefined,
      email: 'test@example.com',
      type: 'Users' as any,
      created_at: new Date(),
      is_email_verified: false,
    },
    expires: new Date(),
  };

  beforeEach(async () => {
    const mockAuthService = {
      sign_in_validated_account: jest.fn(),
      sign_out: jest.fn(),
      whoami: jest.fn(),
      generate_refresh: jest.fn(),
      signin_email_verify: jest.fn(),
      signin_email_otp: jest.fn(),
      recovery_verify: jest.fn(),
      recover: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sign_in_password', () => {
    it('should sign in with password successfully', async () => {
      authService.sign_in_validated_account = jest
        .fn()
        .mockResolvedValue(mockSigninResponse);

      const result = await controller.sign_in_password(mockReqExpress);

      expect(authService.sign_in_validated_account).toHaveBeenCalledWith(
        mockReqExpress.user,
      );
      expect(result).toEqual(mockSigninResponse);
    });

    it('should propagate errors from service', async () => {
      const error = new Error('Authentication failed');
      authService.sign_in_validated_account = jest
        .fn()
        .mockRejectedValue(error);

      await expect(controller.sign_in_password(mockReqExpress)).rejects.toThrow(
        'Authentication failed',
      );
    });
  });

  describe('sign_out', () => {
    it('should sign out successfully', async () => {
      const mockUser = {
        id: 'user-id-1',
        ref_id: 'user-ref-1',
        email: 'test@example.com',
      };
      authService.sign_out = jest.fn().mockResolvedValue(mockUser);

      const result = await controller.sign_out(mockReqExpress);

      expect(authService.sign_out).toHaveBeenCalledWith(
        mockReqExpress.user.token,
      );
      expect(result).toEqual(mockUser);
    });

    it('should propagate errors from service', async () => {
      const error = new Error('Sign out failed');
      authService.sign_out = jest.fn().mockRejectedValue(error);

      await expect(controller.sign_out(mockReqExpress)).rejects.toThrow(
        'Sign out failed',
      );
    });
  });

  describe('whoami', () => {
    it('should return user information', async () => {
      const mockUser = {
        id: 'user-id-1',
        ref_id: 'user-ref-1',
        email: 'test@example.com',
        display_name: 'Test User',
      };
      authService.whoami = jest.fn().mockResolvedValue(mockUser);

      const result = await controller.whoami(mockReqExpress);

      expect(authService.whoami).toHaveBeenCalledWith(mockReqExpress.user.id);
      expect(result).toEqual(mockUser);
    });

    it('should propagate errors from service', async () => {
      const error = new Error('User not found');
      authService.whoami = jest.fn().mockRejectedValue(error);

      await expect(controller.whoami(mockReqExpress)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('refresh', () => {
    const refreshDto: RefreshDto = {
      email: 'test@example.com',
      refresh: 'refresh-token-123',
    };

    it('should generate new tokens successfully', async () => {
      authService.generate_refresh = jest
        .fn()
        .mockResolvedValue(mockSigninResponse);

      const result = await controller.refresh(refreshDto);

      expect(authService.generate_refresh).toHaveBeenCalledWith(
        refreshDto.email,
        refreshDto.refresh,
      );
      expect(result).toEqual(mockSigninResponse);
    });

    it('should propagate errors from service', async () => {
      const error = new Error('Invalid refresh token');
      authService.generate_refresh = jest.fn().mockRejectedValue(error);

      await expect(controller.refresh(refreshDto)).rejects.toThrow(
        'Invalid refresh token',
      );
    });
  });

  describe('signin_otp_verify', () => {
    const signinEmailDto: SigninEmailDto = {
      email: 'test@example.com',
    };

    it('should verify email and return type', async () => {
      const mockResponse = {
        type: 'OTP',
        display_name: 'Test User',
      };
      authService.signin_email_verify = jest
        .fn()
        .mockResolvedValue(mockResponse);

      const result = await controller.signin_otp_verify(signinEmailDto);

      expect(authService.signin_email_verify).toHaveBeenCalledWith(
        signinEmailDto,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should return PASSWORD type if user has password', async () => {
      const mockResponse = {
        type: 'PASSWORD',
        display_name: 'Test User',
      };
      authService.signin_email_verify = jest
        .fn()
        .mockResolvedValue(mockResponse);

      const result = await controller.signin_otp_verify(signinEmailDto);

      expect(result).toEqual(mockResponse);
      expect(result.type).toBe('PASSWORD');
    });

    it('should propagate errors from service', async () => {
      const error = new Error('Email not found');
      authService.signin_email_verify = jest.fn().mockRejectedValue(error);

      await expect(
        controller.signin_otp_verify(signinEmailDto),
      ).rejects.toThrow('Email not found');
    });
  });

  describe('signin_otp', () => {
    const signinOtpDto: SigninOtpDto = {
      email: 'test@example.com',
      otp: '123456',
    };

    it('should sign in with OTP successfully', async () => {
      authService.signin_email_otp = jest
        .fn()
        .mockResolvedValue(mockSigninResponse);

      const result = await controller.signin_otp(signinOtpDto);

      expect(authService.signin_email_otp).toHaveBeenCalledWith(signinOtpDto);
      expect(result).toEqual(mockSigninResponse);
    });

    it('should propagate errors from service', async () => {
      const error = new Error('Invalid OTP');
      authService.signin_email_otp = jest.fn().mockRejectedValue(error);

      await expect(controller.signin_otp(signinOtpDto)).rejects.toThrow(
        'Invalid OTP',
      );
    });
  });

  describe('verify_recovery_account', () => {
    const emailDto: EmailDto = {
      email: 'test@example.com',
    };

    it('should verify recovery account successfully', async () => {
      authService.recovery_verify = jest.fn().mockResolvedValue(true);

      const result = await controller.verify_recovery_account(emailDto);

      expect(authService.recovery_verify).toHaveBeenCalledWith(emailDto);
      expect(result).toBe(true);
    });

    it('should propagate errors from service', async () => {
      const error = new Error('User not found');
      authService.recovery_verify = jest.fn().mockRejectedValue(error);

      await expect(
        controller.verify_recovery_account(emailDto),
      ).rejects.toThrow('User not found');
    });
  });

  describe('recover_account', () => {
    const recoverDto: RecoverDto = {
      email: 'test@example.com',
      otp: '123456',
      password: 'newpassword123',
    };

    it('should recover account successfully', async () => {
      const mockUser = {
        id: 'user-id-1',
        ref_id: 'user-ref-1',
        email: 'test@example.com',
      };
      authService.recover = jest.fn().mockResolvedValue(mockUser);

      const result = await controller.recover_account(recoverDto);

      expect(authService.recover).toHaveBeenCalledWith(recoverDto);
      expect(result).toEqual(mockUser);
    });

    it('should propagate errors from service', async () => {
      const error = new Error('Invalid OTP');
      authService.recover = jest.fn().mockRejectedValue(error);

      await expect(controller.recover_account(recoverDto)).rejects.toThrow(
        'Invalid OTP',
      );
    });
  });
});
