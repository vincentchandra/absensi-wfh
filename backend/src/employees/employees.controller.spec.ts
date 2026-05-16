import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

describe('EmployeesController', () => {
  let controller: EmployeesController;
  let service: jest.Mocked<Partial<EmployeesService>>;

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [{ provide: EmployeesService, useValue: service }],
    }).compile();

    controller = module.get<EmployeesController>(EmployeesController);
  });

  describe('findAll', () => {
    it('should delegate to service with parsed pagination', async () => {
      const expectedResult = { data: [], total: 0, page: 1, limit: 10 };
      service.findAll!.mockResolvedValue(expectedResult);

      const result = await controller.findAll('1', '10');

      expect(service.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(expectedResult);
    });

    it('should use default pagination values', async () => {
      service.findAll!.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 });

      await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('findOne', () => {
    it('should delegate to service with parsed id', async () => {
      const employee = { id: 1, name: 'Test' };
      service.findOne!.mockResolvedValue(employee as any);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(employee);
    });
  });

  describe('create', () => {
    it('should delegate to service with dto', async () => {
      const dto = { nip: 'EMP001', name: 'Test', department: 'IT', position: 'Dev' };
      const created = { id: 1, ...dto };
      service.create!.mockResolvedValue(created as any);

      const result = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('should delegate to service with id and dto', async () => {
      const dto = { name: 'Updated' };
      const updated = { id: 1, name: 'Updated' };
      service.update!.mockResolvedValue(updated as any);

      const result = await controller.update(1, dto as any);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should delegate to service with id', async () => {
      service.remove!.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
