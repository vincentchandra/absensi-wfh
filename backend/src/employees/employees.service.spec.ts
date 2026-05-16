import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';
import { User, UserRole } from '../users/entities/user.entity';

jest.mock('bcrypt');

describe('EmployeesService', () => {
  let service: EmployeesService;
  let employeeRepo: Record<string, jest.Mock>;
  let userRepo: Record<string, jest.Mock>;

  const mockEmployee = {
    id: 1,
    nip: 'EMP001',
    name: 'John Doe',
    email: 'john@example.com',
    department: 'Engineering',
    position: 'Developer',
    phone: '08123456789',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    employeeRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    userRepo = {
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: getRepositoryToken(Employee), useValue: employeeRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated employee list', async () => {
      const employees = [mockEmployee];
      employeeRepo.findAndCount.mockResolvedValue([employees, 1]);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({ data: employees, total: 1, page: 1, limit: 10 });
      expect(employeeRepo.findAndCount).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
    });

    it('should calculate correct skip for page 2', async () => {
      employeeRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(2, 5);

      expect(employeeRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
    });
  });

  describe('findOne', () => {
    it('should return employee by id', async () => {
      employeeRepo.findOne.mockResolvedValue(mockEmployee);

      const result = await service.findOne(1);

      expect(result).toEqual(mockEmployee);
      expect(employeeRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when employee not found', async () => {
      employeeRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto = {
      nip: 'EMP002',
      name: 'Jane Smith',
      email: 'jane@example.com',
      department: 'HR',
      position: 'Manager',
      phone: '08198765432',
    };

    it('should create employee and auto-create user account', async () => {
      employeeRepo.findOne.mockResolvedValue(null); // NIP not taken
      employeeRepo.create.mockReturnValue(createDto);
      employeeRepo.save.mockResolvedValue({ id: 2, ...createDto });
      userRepo.create.mockReturnValue({});
      userRepo.save.mockResolvedValue({});
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_default_password');

      const result = await service.create(createDto);

      expect(result).toEqual({ id: 2, ...createDto });
      expect(employeeRepo.save).toHaveBeenCalled();
      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'EMP002',
          role: UserRole.EMPLOYEE,
          needResetPassword: true,
        }),
      );
      expect(userRepo.save).toHaveBeenCalled();
    });

    it('should throw ConflictException when NIP already exists', async () => {
      employeeRepo.findOne.mockResolvedValue(mockEmployee); // NIP already taken

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should use provided password instead of default', async () => {
      const dtoWithPassword = { ...createDto, password: 'custompass123' };
      employeeRepo.findOne.mockResolvedValue(null);
      employeeRepo.create.mockReturnValue(dtoWithPassword);
      employeeRepo.save.mockResolvedValue({ id: 3, ...dtoWithPassword });
      userRepo.create.mockReturnValue({});
      userRepo.save.mockResolvedValue({});
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_custom');

      await service.create(dtoWithPassword);

      expect(bcrypt.hash).toHaveBeenCalledWith('custompass123', 'salt');
    });
  });

  describe('update', () => {
    it('should update employee fields', async () => {
      employeeRepo.findOne.mockResolvedValue({ ...mockEmployee });
      employeeRepo.save.mockResolvedValue({ ...mockEmployee, name: 'Updated Name' });

      const result = await service.update(1, { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
      expect(employeeRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when employee not found', async () => {
      employeeRepo.findOne.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove employee and associated user account', async () => {
      employeeRepo.findOne.mockResolvedValue(mockEmployee);
      userRepo.delete.mockResolvedValue({});
      employeeRepo.remove.mockResolvedValue(mockEmployee);

      await service.remove(1);

      expect(userRepo.delete).toHaveBeenCalledWith({ employee: { id: 1 } });
      expect(employeeRepo.remove).toHaveBeenCalledWith(mockEmployee);
    });

    it('should throw NotFoundException when employee not found', async () => {
      employeeRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
