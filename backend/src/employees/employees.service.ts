import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Employee } from './entities/employee.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.employeeRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    return employee;
  }

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    // Check if NIP already exists
    const existing = await this.employeeRepository.findOne({
      where: { nip: dto.nip },
    });

    if (existing) {
      throw new ConflictException(`NIP ${dto.nip} sudah terdaftar`);
    }

    // Create employee record
    const employee = this.employeeRepository.create({
      nip: dto.nip,
      name: dto.name,
      email: dto.email,
      department: dto.department,
      position: dto.position,
      phone: dto.phone,
    });

    const savedEmployee = await this.employeeRepository.save(employee);

    // Auto-create user account for this employee
    const defaultPassword = dto.password || 'dexa2026';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    const user = this.userRepository.create({
      username: dto.nip,
      password: hashedPassword,
      role: UserRole.EMPLOYEE,
      needResetPassword: true,
      employee: savedEmployee,
    });

    await this.userRepository.save(user);

    return savedEmployee;
  }

  async update(id: number, dto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);

    Object.assign(employee, dto);

    return this.employeeRepository.save(employee);
  }

  async remove(id: number): Promise<void> {
    const employee = await this.findOne(id);

    // Also remove associated user account
    await this.userRepository.delete({ employee: { id: employee.id } });
    await this.employeeRepository.remove(employee);
  }
}
