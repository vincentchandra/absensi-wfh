import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;

  const mockEmployee = { id: 1, name: 'John Doe', nip: 'EMP001' };
  const mockUser = {
    id: 1,
    username: 'EMP001',
    password: 'hashed_password',
    role: 'EMPLOYEE',
    needResetPassword: false,
    employee: mockEmployee,
  };

  beforeEach(async () => {
    usersService = {
      findByUsername: jest.fn(),
      findById: jest.fn(),
      updatePassword: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock_jwt_token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return access_token and user data on valid credentials', async () => {
      usersService.findByUsername!.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ username: 'EMP001', password: 'password123' });

      expect(result).toHaveProperty('access_token', 'mock_jwt_token');
      expect(result.user).toEqual({
        id: 1,
        username: 'EMP001',
        role: 'EMPLOYEE',
        needResetPassword: false,
        employee: { id: 1, name: 'John Doe', nip: 'EMP001' },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        username: 'EMP001',
        role: 'EMPLOYEE',
        employeeId: 1,
      });
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

    it('should handle user without employee (admin)', async () => {
      const adminUser = { ...mockUser, role: 'ADMIN', employee: null };
      usersService.findByUsername!.mockResolvedValue(adminUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ username: 'EMP001', password: 'password123' });

      expect(result.user.employee).toBeNull();
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ employeeId: null }),
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
      expect(usersService.updatePassword).toHaveBeenCalledWith(1, 'new_hashed_password');
    });

    it('should throw BadRequestException when confirm password does not match', async () => {
      const dto = { ...changePasswordDto, confirmPassword: 'DifferentPass123' };

      await expect(service.changePassword(1, dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      usersService.findById!.mockResolvedValue(null);

      await expect(service.changePassword(999, changePasswordDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw BadRequestException when old password is wrong', async () => {
      usersService.findById!.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.changePassword(1, changePasswordDto)).rejects.toThrow(
        BadRequestException,
      );
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

      await expect(service.getProfile(999)).rejects.toThrow(UnauthorizedException);
    });

    it('should handle user without employee', async () => {
      const adminUser = { ...mockUser, employee: null };
      usersService.findById!.mockResolvedValue(adminUser as any);

      const result = await service.getProfile(1);

      expect(result.employee).toBeNull();
    });
  });
});
