import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AttendancesController } from './attendances.controller';
import { AttendancesService } from './attendances.service';

describe('AttendancesController', () => {
  let controller: AttendancesController;
  let service: jest.Mocked<Partial<AttendancesService>>;

  const mockReq = {
    user: { userId: 1, employeeId: 5, role: 'EMPLOYEE' },
  };

  beforeEach(async () => {
    service = {
      clockIn: jest.fn(),
      clockOut: jest.fn(),
      findMyAttendances: jest.fn(),
      getTodayAttendance: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendancesController],
      providers: [{ provide: AttendancesService, useValue: service }],
    }).compile();

    controller = module.get<AttendancesController>(AttendancesController);
  });

  describe('clockIn', () => {
    it('should delegate to service with employeeId, filename, and notes', async () => {
      const mockPhoto = {
        filename: 'attendance-123.jpg',
      } as Express.Multer.File;
      const dto = { notes: 'WFH today' };
      service.clockIn!.mockResolvedValue({ id: 1 } as any);

      const result = await controller.clockIn(mockReq, mockPhoto, dto as any);

      expect(service.clockIn).toHaveBeenCalledWith(
        5,
        'attendance-123.jpg',
        'WFH today',
      );
      expect(result).toEqual({ id: 1 });
    });

    it('should throw BadRequestException when no photo uploaded', async () => {
      await expect(
        controller.clockIn(mockReq, undefined as any, {} as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('clockOut', () => {
    it('should delegate to service with employeeId', async () => {
      service.clockOut!.mockResolvedValue({
        id: 1,
        clockOut: '17:00:00',
      } as any);

      const result = await controller.clockOut(mockReq);

      expect(service.clockOut).toHaveBeenCalledWith(5);
      expect(result).toHaveProperty('clockOut');
    });
  });

  describe('findMyAttendances', () => {
    it('should delegate to service with pagination', async () => {
      const expectedResult = { data: [], total: 0, page: 1, limit: 10 };
      service.findMyAttendances!.mockResolvedValue(expectedResult);

      const result = await controller.findMyAttendances(mockReq, '1', '10');

      expect(service.findMyAttendances).toHaveBeenCalledWith(5, 1, 10);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getTodayAttendance', () => {
    it('should delegate to service with employeeId', async () => {
      service.getTodayAttendance!.mockResolvedValue(null);

      const result = await controller.getTodayAttendance(mockReq);

      expect(service.getTodayAttendance).toHaveBeenCalledWith(5);
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should delegate to service with parsed filters', async () => {
      const expectedResult = { data: [], total: 0, page: 1, limit: 10 };
      service.findAll!.mockResolvedValue(expectedResult);

      const result = await controller.findAll('1', '10', '2026-05-16', '3');

      expect(service.findAll).toHaveBeenCalledWith(1, 10, '2026-05-16', 3);
      expect(result).toEqual(expectedResult);
    });

    it('should pass undefined for optional filters when not provided', async () => {
      service.findAll!.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await controller.findAll('1', '10');

      expect(service.findAll).toHaveBeenCalledWith(1, 10, undefined, undefined);
    });
  });
});
