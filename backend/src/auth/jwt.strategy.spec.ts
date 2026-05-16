import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    const configService = {
      get: jest.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService;

    strategy = new JwtStrategy(configService);
  });

  describe('validate', () => {
    it('should return the correct user payload shape', async () => {
      const jwtPayload = {
        sub: 1,
        username: 'EMP001',
        role: 'EMPLOYEE',
        employeeId: 5,
      };

      const result = await strategy.validate(jwtPayload);

      expect(result).toEqual({
        userId: 1,
        username: 'EMP001',
        role: 'EMPLOYEE',
        employeeId: 5,
      });
    });

    it('should handle null employeeId (admin user)', async () => {
      const jwtPayload = {
        sub: 2,
        username: 'admin',
        role: 'ADMIN',
        employeeId: null,
      };

      const result = await strategy.validate(jwtPayload);

      expect(result).toEqual({
        userId: 2,
        username: 'admin',
        role: 'ADMIN',
        employeeId: null,
      });
    });
  });
});
