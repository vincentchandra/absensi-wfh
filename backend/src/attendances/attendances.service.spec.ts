import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AttendancesService } from './attendances.service';
import { Attendance } from './entities/attendance.entity';
import { Employee } from '../employees/entities/employee.entity';

describe('AttendancesService', () => {
  let service: AttendancesService;
  let attendanceRepo: Record<string, jest.Mock>;
  let employeeRepo: Record<string, jest.Mock>;

  const mockEmployee = {
    id: 1,
    nip: 'EMP001',
    name: 'John Doe',
  };

  const mockAttendance = {
    id: 1,
    employee: mockEmployee,
    attendanceDate: '2026-05-16',
    clockIn: '08:00:00',
    clockOut: null,
    photoUrl: '/uploads/attendance-123.jpg',
    status: 'WFH',
    notes: null,
  };

  beforeEach(async () => {
    attendanceRepo = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    employeeRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendancesService,
        { provide: getRepositoryToken(Attendance), useValue: attendanceRepo },
        { provide: getRepositoryToken(Employee), useValue: employeeRepo },
      ],
    }).compile();

    service = module.get<AttendancesService>(AttendancesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('clockIn', () => {
    it('should create attendance record successfully', async () => {
      attendanceRepo.findOne.mockResolvedValue(null); // no existing clock-in
      employeeRepo.findOne.mockResolvedValue(mockEmployee);
      attendanceRepo.create.mockReturnValue(mockAttendance);
      attendanceRepo.save.mockResolvedValue(mockAttendance);

      const result = await service.clockIn(1, 'attendance-123.jpg', 'WFH today');

      expect(result).toEqual(mockAttendance);
      expect(attendanceRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          employee: mockEmployee,
          status: 'WFH',
        }),
      );
    });

    it('should throw BadRequestException if already clocked in today', async () => {
      attendanceRepo.findOne.mockResolvedValue(mockAttendance); // already exists

      await expect(
        service.clockIn(1, 'photo.jpg'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if employee does not exist', async () => {
      attendanceRepo.findOne.mockResolvedValue(null); // no existing
      employeeRepo.findOne.mockResolvedValue(null); // employee not found

      await expect(
        service.clockIn(999, 'photo.jpg'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('clockOut', () => {
    it('should update attendance with clock-out time', async () => {
      const attendanceWithoutClockOut = { ...mockAttendance, clockOut: null };
      attendanceRepo.findOne.mockResolvedValue(attendanceWithoutClockOut);
      attendanceRepo.save.mockResolvedValue({ ...attendanceWithoutClockOut, clockOut: '17:00:00' });

      const result = await service.clockOut(1);

      expect(result.clockOut).toBe('17:00:00');
      expect(attendanceRepo.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if not clocked in today', async () => {
      attendanceRepo.findOne.mockResolvedValue(null);

      await expect(service.clockOut(1)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if already clocked out', async () => {
      const attendanceWithClockOut = { ...mockAttendance, clockOut: '17:00:00' };
      attendanceRepo.findOne.mockResolvedValue(attendanceWithClockOut);

      await expect(service.clockOut(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findMyAttendances', () => {
    it('should return paginated attendance list for employee', async () => {
      const attendances = [mockAttendance];
      attendanceRepo.findAndCount.mockResolvedValue([attendances, 1]);

      const result = await service.findMyAttendances(1, 1, 10);

      expect(result).toEqual({ data: attendances, total: 1, page: 1, limit: 10 });
      expect(attendanceRepo.findAndCount).toHaveBeenCalledWith({
        where: { employee: { id: 1 } },
        order: { attendanceDate: 'DESC' },
        skip: 0,
        take: 10,
      });
    });

    it('should calculate correct skip for page 3', async () => {
      attendanceRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findMyAttendances(1, 3, 5);

      expect(attendanceRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated results using query builder', async () => {
      const mockQb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockAttendance], 1]),
      };
      attendanceRepo.createQueryBuilder.mockReturnValue(mockQb);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({ data: [mockAttendance], total: 1, page: 1, limit: 10 });
    });

    it('should apply date filter when provided', async () => {
      const mockQb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      attendanceRepo.createQueryBuilder.mockReturnValue(mockQb);

      await service.findAll(1, 10, '2026-05-16');

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'attendance.attendance_date = :date',
        { date: '2026-05-16' },
      );
    });

    it('should apply employeeId filter when provided', async () => {
      const mockQb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      attendanceRepo.createQueryBuilder.mockReturnValue(mockQb);

      await service.findAll(1, 10, undefined, 5);

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'employee.nip = :employeeId',
        { employeeId: 5 },
      );
    });
  });

  describe('getTodayAttendance', () => {
    it('should return today\'s attendance for employee', async () => {
      attendanceRepo.findOne.mockResolvedValue(mockAttendance);

      const result = await service.getTodayAttendance(1);

      expect(result).toEqual(mockAttendance);
    });

    it('should return null when no attendance today', async () => {
      attendanceRepo.findOne.mockResolvedValue(null);

      const result = await service.getTodayAttendance(1);

      expect(result).toBeNull();
    });
  });
});
