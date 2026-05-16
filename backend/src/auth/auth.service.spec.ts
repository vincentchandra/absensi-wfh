import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { MfaService } from './mfa.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;
  let mfaService: jest.Mocked<Partial<MfaService>>;

  const mockEmployee = { id: 1, name: 'John Doe', nip: 'EMP001' };
  const mockUser = {
    id: 1,
    username: 'EMP001',
    password: 'hashed_password',
    role: 'EMPLOYEE',
    needResetPassword: false,
    employee: mockEmployee,
    mfaEnabled: false,
    mfaSecret: null,
  };

  beforeEach(async () => {
    usersService = {
      findByUsername: jest.fn(),
      findById: jest.fn(),
      updatePassword: jest.fn(),
      updateMfaSecret: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock_jwt_token'),
      verify: jest.fn(),
    };

    mfaService = {
      generateSecret: jest.fn().mockReturnValue({
        secret: 'TESTSECRET',
        otpauthUrl: 'otpauth://totp/Test?secret=TESTSECRET',
      }),
      generateQRCode: jest
        .fn()
        .mockResolvedValue('data:image/png;base64,mock_qr'),
      encryptSecret: jest.fn().mockReturnValue('encrypted_secret'),
      decryptSecret: jest.fn().mockReturnValue('TESTSECRET'),
      verifyToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: MfaService, useValue: mfaService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return tempToken and requireMfaSetup when MFA not enabled', async () => {
      usersService.findByUsername!.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        username: 'EMP001',
        password: 'password123',
      });

      expect(result).toHaveProperty('tempToken', 'mock_jwt_token');
      expect(result).toHaveProperty('requireMfaSetup', true);
      expect(result).toHaveProperty('qrCode', 'data:image/png;base64,mock_qr');
      expect(mfaService.generateSecret).toHaveBeenCalled();
      expect(usersService.updateMfaSecret).toHaveBeenCalledWith(
        1,
        'encrypted_secret',
      );
    });

    it('should return tempToken without setup when MFA already enabled', async () => {
      const userWithMfa = {
        ...mockUser,
        mfaEnabled: true,
        mfaSecret: 'encrypted_secret',
      };
      usersService.findByUsername!.mockResolvedValue(userWithMfa as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        username: 'EMP001',
        password: 'password123',
      });

      expect(result).toHaveProperty('tempToken', 'mock_jwt_token');
      expect(result).toHaveProperty('requireMfaSetup', false);
      expect(result).not.toHaveProperty('qrCode');
      expect(mfaService.generateSecret).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      usersService.findByUsername!.mockResolvedValue(null);

      await expect(
        service.login({ username: 'nonexistent', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      usersService.findByUsername!.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ username: 'EMP001', password: 'wrong_password' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('verifyTotp', () => {
    const verifyTotpDto = {
      tempToken: 'temp_token',
      totpCode: '123456',
    };

    it('should return access_token and user data on valid TOTP', async () => {
      const userWithMfa = {
        ...mockUser,
        mfaEnabled: true,
        mfaSecret: 'encrypted_secret',
      };
      jwtService.verify!.mockReturnValue({
        sub: 1,
        username: 'EMP001',
        type: 'temp',
      });
      usersService.findById!.mockResolvedValue(userWithMfa as any);
      mfaService.verifyToken!.mockReturnValue(true);

      const result = await service.verifyTotp(verifyTotpDto);

      expect(result).toHaveProperty('access_token', 'mock_jwt_token');
      expect(result.user).toEqual({
        id: 1,
        username: 'EMP001',
        role: 'EMPLOYEE',
        needResetPassword: false,
        employee: { id: 1, name: 'John Doe', nip: 'EMP001' },
      });
      expect(mfaService.decryptSecret).toHaveBeenCalledWith('encrypted_secret');
      expect(mfaService.verifyToken).toHaveBeenCalledWith(
        'TESTSECRET',
        '123456',
      );
    });

    it('should throw UnauthorizedException when temp token is invalid', async () => {
      jwtService.verify!.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.verifyTotp(verifyTotpDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token type is not temp', async () => {
      jwtService.verify!.mockReturnValue({
        sub: 1,
        username: 'EMP001',
        type: 'access',
      });

      await expect(service.verifyTotp(verifyTotpDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      jwtService.verify!.mockReturnValue({
        sub: 1,
        username: 'EMP001',
        type: 'temp',
      });
      usersService.findById!.mockResolvedValue(null);

      await expect(service.verifyTotp(verifyTotpDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when TOTP code is invalid', async () => {
      const userWithMfa = {
        ...mockUser,
        mfaEnabled: true,
        mfaSecret: 'encrypted_secret',
      };
      jwtService.verify!.mockReturnValue({
        sub: 1,
        username: 'EMP001',
        type: 'temp',
      });
      usersService.findById!.mockResolvedValue(userWithMfa as any);
      mfaService.verifyToken!.mockReturnValue(false);

      await expect(service.verifyTotp(verifyTotpDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('changePassword', () => {
    const changePasswordDto = {
      oldPassword: 'old_pass',
      newPassword: 'NewPass123',
      confirmPassword: 'NewPass123',
    };

    it('should change password successfully', async () => {
      usersService.findById!.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');
      usersService.updatePassword!.mockResolvedValue(undefined);

      const result = await service.changePassword(1, changePasswordDto);

      expect(result).toEqual({ message: 'Password berhasil diubah' });
      expect(usersService.updatePassword).toHaveBeenCalledWith(
        1,
        'new_hashed_password',
      );
    });

    it('should throw BadRequestException when confirm password does not match', async () => {
      const dto = { ...changePasswordDto, confirmPassword: 'DifferentPass123' };

      await expect(service.changePassword(1, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      usersService.findById!.mockResolvedValue(null);

      await expect(
        service.changePassword(999, changePasswordDto),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException when old password is wrong', async () => {
      usersService.findById!.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword(1, changePasswordDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile data', async () => {
      usersService.findById!.mockResolvedValue(mockUser as any);

      const result = await service.getProfile(1);

      expect(result).toEqual({
        id: 1,
        username: 'EMP001',
        role: 'EMPLOYEE',
        needResetPassword: false,
        employee: { id: 1, name: 'John Doe', nip: 'EMP001' },
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      usersService.findById!.mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle user without employee', async () => {
      const adminUser = { ...mockUser, employee: null };
      usersService.findById!.mockResolvedValue(adminUser as any);

      const result = await service.getProfile(1);

      expect(result.employee).toBeNull();
    });
  });
});
