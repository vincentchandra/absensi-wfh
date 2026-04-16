import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('attendances')
@Unique(['employee', 'attendanceDate'])
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Employee, (employee) => employee.attendances, {
    eager: true,
  })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'attendance_date', type: 'date' })
  attendanceDate: string;

  @Column({ name: 'clock_in', type: 'time' })
  clockIn: string;

  @Column({ name: 'clock_out', type: 'time', nullable: true })
  clockOut: string;

  @Column({ name: 'photo_url', type: 'varchar', length: 255 })
  photoUrl: string;

  @Column({ type: 'varchar', length: 10, default: 'WFH' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
