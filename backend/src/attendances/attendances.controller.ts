import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AttendancesService } from './attendances.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

// Multer config for photo upload — similar to Spring's MultipartResolver
const photoStorage = diskStorage({
  destination: './uploads',
  filename: (_req, file, callback) => {
    // Sanitize filename: timestamp + random suffix + original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname).toLowerCase();
    callback(null, `attendance-${uniqueSuffix}${ext}`);
  },
});

@Controller('attendances')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  @Post('clock-in')
  @Roles(UserRole.EMPLOYEE)
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: photoStorage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
      fileFilter: (_req, file, callback) => {
        const allowed = /\.(jpg|jpeg|png)$/i;
        if (!allowed.test(extname(file.originalname))) {
          return callback(
            new BadRequestException('Hanya file JPG/PNG yang diizinkan'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async clockIn(
    @Request() req: any,
    @UploadedFile() photo: Express.Multer.File,
    @Body() dto: CreateAttendanceDto,
  ) {
    if (!photo) {
      throw new BadRequestException('Foto wajib di-upload untuk clock-in');
    }

    return this.attendancesService.clockIn(
      req.user.employeeId || (await this.getEmployeeId(req)),
      photo.filename,
      dto.notes,
    );
  }

  @Patch('clock-out')
  @Roles(UserRole.EMPLOYEE)
  async clockOut(@Request() req: any) {
    const employeeId = req.user.employeeId || (await this.getEmployeeId(req));
    return this.attendancesService.clockOut(employeeId);
  }

  @Get('my')
  @Roles(UserRole.EMPLOYEE)
  async findMyAttendances(
    @Request() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const employeeId = req.user.employeeId || (await this.getEmployeeId(req));
    return this.attendancesService.findMyAttendances(
      employeeId,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @Get('today')
  @Roles(UserRole.EMPLOYEE)
  async getTodayAttendance(@Request() req: any) {
    const employeeId = req.user.employeeId || (await this.getEmployeeId(req));
    return this.attendancesService.getTodayAttendance(employeeId);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('date') date?: string,
    @Query('employee_id') employeeId?: string,
  ) {
    return this.attendancesService.findAll(
      parseInt(page, 10),
      parseInt(limit, 10),
      date,
      employeeId ? parseInt(employeeId, 10) : undefined,
    );
  }

  // Helper: resolve employeeId from JWT user
  private async getEmployeeId(req: any): Promise<number> {
    if (req.user?.employeeId) {
      return req.user.employeeId;
    }
    throw new BadRequestException(
      'Employee ID tidak ditemukan. Hubungi admin.',
    );
  }
}
