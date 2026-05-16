import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: Record<string, jest.Mock>;

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
    userRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: userRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUsername', () => {
    it('should return user with employee relation', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findByUsername('EMP001');

      expect(result).toEqual(mockUser);
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { username: 'EMP001' },
        relations: ['employee'],
      });
    });

    it('should return null when user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      const result = await service.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user with employee relation', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(1);

      expect(result).toEqual(mockUser);
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['employee'],
      });
    });

    it('should return null when user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and save a user', async () => {
      const userData = { username: 'newuser', password: 'hashed', role: 'EMPLOYEE' };
      userRepo.create.mockReturnValue(userData);
      userRepo.save.mockResolvedValue({ id: 2, ...userData });

      const result = await service.create(userData as any);

      expect(result).toEqual({ id: 2, ...userData });
      expect(userRepo.create).toHaveBeenCalledWith(userData);
      expect(userRepo.save).toHaveBeenCalled();
    });
  });

  describe('updatePassword', () => {
    it('should update password and set needResetPassword to false', async () => {
      userRepo.update.mockResolvedValue({ affected: 1 });

      await service.updatePassword(1, 'new_hashed_password');

      expect(userRepo.update).toHaveBeenCalledWith(1, {
        password: 'new_hashed_password',
        needResetPassword: false,
      });
    });
  });
});
