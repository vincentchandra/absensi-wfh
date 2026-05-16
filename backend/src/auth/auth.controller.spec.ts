import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<Partial<AuthService>>;

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      changePassword: jest.fn(),
      getProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('login', () => {
    it('should delegate to authService.login', async () => {
      const loginDto = { username: 'EMP001', password: 'password123' };
      const expectedResult = { access_token: 'token', user: { id: 1 } };
      authService.login!.mockResolvedValue(expectedResult as any);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('changePassword', () => {
    it('should delegate to authService.changePassword with userId from request', async () => {
      const dto = {
        oldPassword: 'old',
        newPassword: 'New123abc',
        confirmPassword: 'New123abc',
      };
      const req = { user: { userId: 1 } };
      authService.changePassword!.mockResolvedValue({
        message: 'Password berhasil diubah',
      });

      const result = await controller.changePassword(req, dto);

      expect(authService.changePassword).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual({ message: 'Password berhasil diubah' });
    });
  });

  describe('getProfile', () => {
    it('should delegate to authService.getProfile with userId from request', async () => {
      const req = { user: { userId: 5 } };
      const profileData = { id: 5, username: 'admin', role: 'ADMIN' };
      authService.getProfile!.mockResolvedValue(profileData as any);

      const result = await controller.getProfile(req);

      expect(authService.getProfile).toHaveBeenCalledWith(5);
      expect(result).toEqual(profileData);
    });
  });
});
