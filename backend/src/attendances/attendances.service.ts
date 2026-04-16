import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { Employee } from '../employees/entities/employee.entity';

@Injectable()
export class AttendancesService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) { }

  async clockIn(
    employeeId: number,
    photoFilename: string,
    notes?: string,
  ) {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const clockInTime = now.toTimeString().split(' ')[0]; // HH:mm:ss

    // Check if already clocked in today
    const existing = await this.attendanceRepository.findOne({
      where: {
        employee: { id: employeeId },
        attendanceDate: today,
      },
    });

    if (existing) {
      throw new BadRequestException('Anda sudah clock-in hari ini');
    }

    // Verify employee exists
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Data karyawan tidak ditemukan');
    }

    const attendance = this.attendanceRepository.create({
      employee,
      attendanceDate: today,
      clockIn: clockInTime,
      photoUrl: `/uploads/${photoFilename}`,
      status: 'WFH',
      notes: notes || undefined,
    });

    return this.attendanceRepository.save(attendance);
  }

  async clockOut(employeeId: number) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const clockOutTime = now.toTimeString().split(' ')[0];

    const attendance = await this.attendanceRepository.findOne({
      where: {
        employee: { id: employeeId },
        attendanceDate: today,
      },
    });

    if (!attendance) {
      throw new BadRequestException('Anda belum clock-in hari ini');
    }

    if (attendance.clockOut) {
      throw new BadRequestException('Anda sudah clock-out hari ini');
    }

    attendance.clockOut = clockOutTime;
    return this.attendanceRepository.save(attendance);
  }

  async findMyAttendances(
    employeeId: number,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.attendanceRepository.findAndCount({
      where: { employee: { id: employeeId } },
      order: { attendanceDate: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    date?: string,
    employeeId?: number,
  ) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.employee', 'employee')
      .orderBy('attendance.attendanceDate', 'DESC')
      .addOrderBy('attendance.clockIn', 'DESC')
      .skip(skip)
      .take(limit);

    if (date) {
      queryBuilder.andWhere('attendance.attendance_date = :date', { date });
    }

    if (employeeId) {
      queryBuilder.andWhere('employee.id = :employeeId', { employeeId });
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total, page, limit };
  }

  async getTodayAttendance(employeeId: number) {
    const today = new Date().toISOString().split('T')[0];

    return this.attendanceRepository.findOne({
      where: {
        employee: { id: employeeId },
        attendanceDate: today,
      },
    });
  }
}
